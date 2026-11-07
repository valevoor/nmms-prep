// Extracts usable text and images from a large textbook PDF, using only what comes with macOS.
//
//   survey <pdf>                         which pages have real text, and PDF page − book page
//   ocr    <pdf> [--from N] [--to N]     recognises each page's text into the cache; safe to re-run
//   find   <pdf> <regex> [--offset N] [--from N] [--to N]    pages whose text matches
//   render <pdf> <out-dir> [--offset N] <page>...            pages as PNG files to read by eye
//
// Page numbers are PDF pages, or book pages when --offset is given (book page = PDF page − offset).
// The cache is .textbook-cache/<book>/pN.txt under the current folder, which git ignores.
import AppKit
import Foundation
import PDFKit
import Vision

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8))
  exit(1)
}

func open(_ path: String) -> PDFDocument {
  guard let d = PDFDocument(url: URL(fileURLWithPath: path)) else { fail("Can't open \(path)") }
  return d
}

func cacheDir(_ pdf: String) -> String {
  let name = ((pdf as NSString).lastPathComponent as NSString).deletingPathExtension
  let slug = name.lowercased().replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
  return ".textbook-cache/\(slug)"
}

/// A page as an image whose longer side is `size` pixels.
func image(_ page: PDFPage, size: CGFloat) -> NSImage {
  let b = page.bounds(for: .mediaBox)
  let s = size / max(b.width, b.height)
  return page.thumbnail(of: NSSize(width: b.width * s, height: b.height * s), for: .mediaBox)
}

func recognise(_ page: PDFPage) -> String? {
  guard let cg = image(page, size: 1800).cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.recognitionLanguages = ["en-US"]
  do { try VNImageRequestHandler(cgImage: cg, options: [:]).perform([request]) } catch { return nil }
  return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}

/// The number printed on a page: a line that is only digits, near the top or bottom of the page.
func printedNumber(_ text: String) -> Int? {
  let lines = text.split(separator: "\n").map { $0.trimmingCharacters(in: .whitespaces) }
  for line in lines.suffix(3).reversed() + lines.prefix(2) {
    let digits = line.trimmingCharacters(in: CharacterSet.decimalDigits.inverted)
    if !digits.isEmpty, digits.count <= 3, line.count <= digits.count + 2, let n = Int(digits) { return n }
  }
  return nil
}

/// Options such as --from 5, and everything else in order.
func parse(_ args: [String]) -> (options: [String: Int], rest: [String]) {
  var options: [String: Int] = [:]
  var rest: [String] = []
  var i = 0
  while i < args.count {
    if args[i].hasPrefix("--") {
      guard i + 1 < args.count, let v = Int(args[i + 1]) else { fail("\(args[i]) needs a number") }
      options[String(args[i].dropFirst(2))] = v
      i += 2
    } else {
      rest.append(args[i])
      i += 1
    }
  }
  return (options, rest)
}

func survey(_ pdf: String) {
  let d = open(pdf)
  let n = d.pageCount
  // A watermark alone is a few dozen characters, so a page needs more than that to count as text.
  let counts = (0..<n).map { d.page(at: $0)?.string?.count ?? 0 }
  let full = counts.filter { $0 > 200 }.count
  let some = counts.filter { $0 > 50 && $0 <= 200 }.count
  print("\(n) pages: \(full) with real text, \(some) with a little, \(n - full - some) image only")
  var votes: [Int: Int] = [:]
  for i in 1...15 {
    let at = n * i / 16
    guard let page = d.page(at: at), let text = recognise(page), let printed = printedNumber(text) else { continue }
    votes[at + 1 - printed, default: 0] += 1
  }
  if let best = votes.max(by: { $0.value < $1.value }) {
    print("offset \(best.key): book page = PDF page − \(best.key) (\(best.value) of 15 sampled pages agree; all votes \(votes))")
  } else {
    print("offset unknown: no printed page numbers were found, so read one page by eye")
  }
  print(full == n ? "OCR is optional for prose, but check formulas by eye." : "Run ocr before searching: many pages have no usable text.")
}

func ocr(_ pdf: String, _ options: [String: Int]) {
  let dir = cacheDir(pdf)
  try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
  let total = open(pdf).pageCount
  let lo = max(options["from"] ?? 1, 1), hi = min(options["to"] ?? total, total)
  guard lo <= hi else { fail("No pages between \(lo) and \(hi)") }
  let todo = (lo...hi).filter { !FileManager.default.fileExists(atPath: "\(dir)/p\($0).txt") }
  print("\(hi - lo + 1 - todo.count) pages already done, \(todo.count) to do → \(dir)")
  let lock = NSLock()
  var next = 0, failed: [Int] = []
  DispatchQueue.concurrentPerform(iterations: min(4, max(todo.count, 1))) { _ in
    let d = open(pdf)  // One document per worker: PDFKit documents aren't safe to share.
    while true {
      lock.lock()
      let i = next
      next += 1
      lock.unlock()
      if i >= todo.count { return }
      let number = todo[i]
      autoreleasepool {
        // Written only when recognition worked, so a re-run retries the rest.
        if let page = d.page(at: number - 1), let text = recognise(page) {
          try? text.write(toFile: "\(dir)/p\(number).txt", atomically: true, encoding: .utf8)
        } else {
          lock.lock()
          failed.append(number)
          lock.unlock()
        }
      }
      if i % 25 == 24 { print("\(i + 1) of \(todo.count)") }
    }
  }
  print(failed.isEmpty ? "Done." : "Failed pages, so re-run: \(failed.sorted())")
}

func find(_ pdf: String, _ pattern: String, _ options: [String: Int]) {
  guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else { fail("Bad regex: \(pattern)") }
  let d = open(pdf)
  let dir = cacheDir(pdf)
  let offset = options["offset"]
  // --from and --to follow the same numbering as the output.
  let shift = offset ?? 0
  let lo = max((options["from"] ?? 1) + shift, 1), hi = min((options["to"] ?? d.pageCount) + shift, d.pageCount)
  guard lo <= hi else { fail("No pages in that range") }
  var missing = 0, found = 0
  for number in lo...hi {
    var text = try? String(contentsOfFile: "\(dir)/p\(number).txt", encoding: .utf8)
    if text == nil {
      missing += 1
      text = d.page(at: number - 1)?.string
    }
    let lines = (text ?? "").split(separator: "\n").map(String.init).filter {
      regex.firstMatch(in: $0, range: NSRange($0.startIndex..., in: $0)) != nil
    }
    guard !lines.isEmpty else { continue }
    found += 1
    let label = offset == nil ? "PDF \(number)" : "book \(number - shift)"
    print("\(label): " + lines.prefix(3).map { String($0.prefix(100)) }.joined(separator: " | "))
  }
  print("\(found) page(s) matched.")
  if missing > 0 { print("\(missing) page(s) had no OCR yet, so only their text layer was searched. Run ocr for a fuller search.") }
  if found == 0 { print("No match doesn't prove the book lacks it: OCR misreads maths. Render the likely pages to check.") }
}

func render(_ pdf: String, _ out: String, _ pages: [String], _ options: [String: Int]) {
  let d = open(pdf)
  try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
  let shift = options["offset"] ?? 0
  let prefix = options["offset"] == nil ? "pdf" : "book"
  for arg in pages {
    guard let shown = Int(arg) else { fail("Not a page number: \(arg)") }
    guard let page = d.page(at: shown + shift - 1) else { fail("No page \(shown)") }
    guard let tiff = image(page, size: 1300).tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
      let png = rep.representation(using: .png, properties: [:])
    else { fail("Couldn't draw page \(shown)") }
    let path = "\(out)/\(prefix)\(shown).png"
    do { try png.write(to: URL(fileURLWithPath: path)) } catch { fail("Couldn't write \(path)") }
    print(path)
  }
}

let (options, rest) = parse(Array(CommandLine.arguments.dropFirst()))
switch rest.first {
case "survey" where rest.count == 2: survey(rest[1])
case "ocr" where rest.count == 2: ocr(rest[1], options)
case "find" where rest.count == 3: find(rest[1], rest[2], options)
case "render" where rest.count >= 4: render(rest[1], rest[2], Array(rest[3...]), options)
default: fail("Usage: textbook survey <pdf> | ocr <pdf> [--from N --to N] | find <pdf> <regex> [--offset N --from N --to N] | render <pdf> <out-dir> [--offset N] <page>...")
}
