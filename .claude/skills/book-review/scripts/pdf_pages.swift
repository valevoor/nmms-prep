// Text or images of any PDF's pages (macOS, nothing to install).
//   swift pdf_pages.swift text <pdf> [first-last | page…]     prints "=== PAGE n ===" then the page's text
//   swift pdf_pages.swift png  <pdf> <out-dir> <page…>        writes <out-dir>/p<n>.png at 2× scale
// Pages are PDF page numbers, starting at 1. Text loses powers, fractions and figures: read those as images.
import PDFKit
import AppKit

let a = CommandLine.arguments
guard a.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: a[2])) else {
  FileHandle.standardError.write("usage: pdf_pages.swift text|png <pdf> …\n".data(using: .utf8)!); exit(1)
}
func pages(_ args: ArraySlice<String>) -> [Int] {
  if args.isEmpty { return Array(1...doc.pageCount) }
  return args.flatMap { s -> [Int] in
    let p = s.split(separator: "-").compactMap { Int($0) }
    return p.count == 2 ? Array(p[0]...p[1]) : p
  }.filter { $0 >= 1 && $0 <= doc.pageCount }
}
if a[1] == "text" {
  print("PAGES:", doc.pageCount)
  for n in pages(a.dropFirst(3)) { print("=== PAGE \(n) ==="); print(doc.page(at: n - 1)?.string ?? "") }
} else if a[1] == "png", a.count >= 5 {
  let out = a[3]
  try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
  for n in pages(a.dropFirst(4)) {
    guard let p = doc.page(at: n - 1) else { continue }
    let r = p.bounds(for: .mediaBox)
    let img = p.thumbnail(of: CGSize(width: r.width * 2, height: r.height * 2), for: .mediaBox)
    let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "\(out)/p\(n).png"))
    print("\(out)/p\(n).png")
  }
} else {
  FileHandle.standardError.write("usage: pdf_pages.swift text <pdf> [pages] | png <pdf> <out-dir> <pages>\n".data(using: .utf8)!); exit(1)
}
