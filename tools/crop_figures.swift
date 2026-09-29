// Crops the figures of a picture chapter out of NMMS.pdf into PNGs for the app.
// Run from the project root:  swift tools/crop_figures.swift tools/figures/ch01.json [contact-sheet.png]
//
// The JSON lists bands: {"page": 10, "band": [x0, y0, x1, y1], "names": ["q01-t1", "q01-t2", "q01-t3"]}.
// The band is in PDF points from the top-left of the page and must hold only the figures of one row
// (plus small marks like ":", "?" and "(A)"). The tool finds the ink columns, keeps the widest
// `names.count` groups (or, with "split": true, cuts the band into equal parts), trims each to its ink
// and renders it straight from the vector PDF, so lines stay sharp at any size.
// A band can instead give exact rects: {"page": 13, "rects": [[x0, y0, x1, y1], ...], "names": [...]}.

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct Band: Decodable {
  let page: Int
  let band: [Double]?
  let rects: [[Double]]?
  let names: [String]
  let split: Bool?
  /// The "(A)" labels sit right under the figures: drop a short last run of ink rows from each figure.
  let labelsBelow: Bool?
  /// Each figure has its own frame and a label ("(C)") may touch it: keep just the frame and what is inside.
  let boxed: Bool?
  /// The "(C)" labels sit just left of unframed figures: drop a small run of ink at the left of each figure.
  let labelsLeft: Bool?
  /// Given rects: shave this many points off each side (to drop borders shared with the next box).
  let inset: Double?
}
struct Spec: Decodable {
  let dir: String
  let bands: [Band]
}

let args = CommandLine.arguments
let spec = try! JSONDecoder().decode(Spec.self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let pdf = CGPDFDocument(URL(fileURLWithPath: "NMMS.pdf") as CFURL)!
let outDir = "app/public/figures/\(spec.dir)"
try! FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

let scale: CGFloat = 3
let pad: CGFloat = 3

/// Renders a rect (points, top-left origin) of a page to an 8-bit grey bitmap.
func render(_ page: Int, _ r: CGRect) -> CGImage {
  let p = pdf.page(at: page)!
  let box = p.getBoxRect(.mediaBox)
  let w = Int((r.width * scale).rounded()), h = Int((r.height * scale).rounded())
  let ctx = CGContext(
    data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue)!
  ctx.setFillColor(gray: 1, alpha: 1)
  ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.scaleBy(x: scale, y: scale)
  // PDF space has its origin at the bottom-left.
  ctx.translateBy(x: -r.minX, y: -(box.height - r.maxY))
  ctx.drawPDFPage(p)
  return ctx.makeImage()!
}

func pixels(_ img: CGImage) -> [UInt8] {
  let data = img.dataProvider!.data! as Data
  var out = [UInt8](repeating: 255, count: img.width * img.height)
  for y in 0..<img.height {
    for x in 0..<img.width { out[y * img.width + x] = data[y * img.bytesPerRow + x] }
  }
  return out
}

/// The ink bounding box of columns [x0, x1) of a bitmap, in pixels, or nil if blank.
func inkBox(_ px: [UInt8], _ w: Int, _ h: Int, _ x0: Int, _ x1: Int) -> (Int, Int, Int, Int)? {
  var minX = Int.max, maxX = -1, minY = Int.max, maxY = -1
  for y in 0..<h {
    for x in x0..<x1 where px[y * w + x] < 170 {
      minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
    }
  }
  return maxX < 0 ? nil : (minX, minY, maxX, maxY)
}

func save(_ img: CGImage, _ path: String) {
  let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, img, nil)
  CGImageDestinationFinalize(dest)
}

var crops: [[CGImage]] = []
for b in spec.bands {
  var rects: [CGRect] = []
  if let given = b.rects {
    let i = b.inset ?? 0
    rects = given.map { CGRect(x: $0[0] + i, y: $0[1] + i, width: $0[2] - $0[0] - 2 * i, height: $0[3] - $0[1] - 2 * i) }
  } else {
    let bb = b.band!
    let band = CGRect(x: bb[0], y: bb[1], width: bb[2] - bb[0], height: bb[3] - bb[1])
    let img = render(b.page, band)
    let w = img.width, h = img.height, px = pixels(img)
    var groups: [(Int, Int)] = []
    if b.split == true {
      let n = b.names.count
      groups = (0..<n).map { (w * $0 / n, w * ($0 + 1) / n) }
    } else {
      // Runs of inked columns; gaps narrower than 4 points belong to the same figure.
      var inked = [Bool](repeating: false, count: w)
      for x in 0..<w { for y in 0..<h where px[y * w + x] < 170 { inked[x] = true; break } }
      var start = -1, lastInk = -1
      for x in 0..<w {
        if inked[x] {
          if start < 0 { start = x } else if x - lastInk > Int(4 * scale) { groups.append((start, lastInk + 1)); start = x }
          lastInk = x
        }
      }
      if start >= 0 { groups.append((start, lastInk + 1)) }
      groups = Array(groups.sorted { $0.1 - $0.0 > $1.1 - $1.0 }.prefix(b.names.count)).sorted { $0.0 < $1.0 }
    }
    if groups.count != b.names.count {
      FileHandle.standardError.write("page \(b.page) \(b.names[0]): found \(groups.count) figures, expected \(b.names.count)\n".data(using: .utf8)!)
      exit(1)
    }
    for g in groups {
      var (x0, y0, x1, y1) = inkBox(px, w, h, g.0, g.1)!
      if b.labelsBelow == true {
        // Find the last blank row gap; if what is below it is short, it is the label.
        let rowInk = (y0...y1).map { y in (g.0..<g.1).contains { px[y * w + $0] < 170 } }
        if let gapEnd = rowInk.lastIndex(of: false), CGFloat(y1 - (y0 + gapEnd)) < 12 * scale {
          let top = rowInk[..<gapEnd].lastIndex(of: true)!
          (x0, y0, x1, y1) = inkBox(Array(px[0..<((y0 + top + 1) * w)]), w, y0 + top + 1, g.0, g.1)!
        }
      }
      if b.labelsLeft == true {
        // Column runs inside the figure; small, short runs at the left are the label's characters.
        let start = x0
        for _ in 0..<4 {
          let colInk = (x0...x1).map { x in (y0...y1).contains { px[$0 * w + x] < 170 } }
          guard let gap = colInk.firstIndex(of: false), let next = colInk[gap...].firstIndex(of: true), CGFloat(x0 + gap - start) < 18 * scale else { break }
          let rowsOfLabel = (y0...y1).filter { y in (x0..<(x0 + gap)).contains { px[y * w + $0] < 170 } }
          if CGFloat(rowsOfLabel.count) >= 14 * scale { break }
          (x0, y0, x1, y1) = inkBox(px, w, h, x0 + next, x1 + 1)!
        }
      }
      if b.boxed == true {
        // The frame's sides are the columns (and rows) with a long unbroken run of ink.
        func run(_ n: Int, _ at: (Int) -> Bool) -> Int {
          var best = 0, cur = 0
          for k in 0..<n { cur = at(k) ? cur + 1 : 0; best = max(best, cur) }
          return best
        }
        let hh = y1 - y0 + 1, ww = x1 - x0 + 1
        let cols = (x0...x1).filter { x in run(hh) { px[(y0 + $0) * w + x] < 170 } > hh * 6 / 10 }
        let rows = (y0...y1).filter { y in run(ww) { px[y * w + x0 + $0] < 170 } > ww * 5 / 10 }
        if let l = cols.first, let r = cols.last, let t = rows.first, let bt = rows.last, r > l, bt > t {
          (x0, y0, x1, y1) = (l, t, r, bt)
        }
      }
      rects.append(
        CGRect(
          x: band.minX + CGFloat(x0) / scale - pad, y: band.minY + CGFloat(y0) / scale - pad,
          width: CGFloat(x1 - x0 + 1) / scale + 2 * pad, height: CGFloat(y1 - y0 + 1) / scale + 2 * pad))
    }
  }
  var row: [CGImage] = []
  for (r, name) in zip(rects, b.names) {
    let img = render(b.page, r)
    save(img, "\(outDir)/\(name).png")
    row.append(img)
  }
  crops.append(row)
}
print("wrote \(crops.flatMap { $0 }.count) figures to \(outDir)")

// Contact sheet: one row per band, for checking the crops by eye.
if args.count > 2 {
  let gap = 12
  let width = crops.map { $0.reduce(0) { $0 + $1.width + gap } }.max()! + gap
  let height = crops.reduce(0) { $0 + ($1.map { $0.height }.max() ?? 0) + gap } + gap
  let ctx = CGContext(
    data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.setFillColor(CGColor(red: 0.85, green: 0.9, blue: 1, alpha: 1))
  ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))
  var top = gap
  for row in crops {
    var x = gap
    let rh = row.map { $0.height }.max() ?? 0
    for img in row {
      ctx.draw(img, in: CGRect(x: x, y: height - top - img.height, width: img.width, height: img.height))
      x += img.width + gap
    }
    top += rh + gap
  }
  save(ctx.makeImage()!, args[2])
}
