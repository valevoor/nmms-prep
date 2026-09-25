// Renders PDF pages to PNG so figures, fractions and superscripts can be checked by eye.
// Run from the project root:  swift tools/render_pages.swift <out-dir> 59 60 136

import PDFKit
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let args = CommandLine.arguments
let d = CGPDFDocument(URL(fileURLWithPath: "NMMS.pdf") as CFURL)!
let out = args[1]
for n in args.dropFirst(2).compactMap({Int($0)}) {
  let p = d.page(at: n)!
  let r = p.getBoxRect(.mediaBox); let s: CGFloat = 2
  let ctx = CGContext(data: nil, width: Int(r.width*s), height: Int(r.height*s), bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.setFillColor(CGColor(red:1,green:1,blue:1,alpha:1)); ctx.fill(CGRect(x:0,y:0,width:r.width*s,height:r.height*s))
  ctx.scaleBy(x: s, y: s); ctx.drawPDFPage(p)
  let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: "\(out)/p\(n).png") as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, ctx.makeImage()!, nil); CGImageDestinationFinalize(dest)
}
