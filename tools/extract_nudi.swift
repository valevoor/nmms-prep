// Dumps a PDF's text with the runs in the Nudi font (Kannada; PDFKit reports it as Helvetica) wrapped in
// ⟦ ⟧, for tools/nudi.ts to convert. Used for the Karnataka papers whose Kannada is real text (macOS only).
// Run from the project root:  swift tools/extract_nudi.swift "pyq/<paper>.pdf" > marked.txt
import PDFKit
import AppKit
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
for i in 0..<d.pageCount {
  print("=== PAGE \(i+1) ===")
  guard let a = d.page(at: i)?.attributedString else { continue }
  var out = ""
  a.enumerateAttribute(.font, in: NSRange(location: 0, length: a.length)) { v, r, _ in
    let n = (v as? NSFont)?.fontName ?? ""
    let s = (a.string as NSString).substring(with: r)
    out += n.hasPrefix("Helvetica") ? "⟦\(s)⟧" : s
  }
  print(out)
}
