// Dumps the text of every PDF page (macOS only, no installs needed).
// Run from the project root:  swift tools/extract_pages.swift > nmms.txt
// Kannada comes out garbled (legacy Nudi font); the English text is clean.
import PDFKit
let d = PDFDocument(url: URL(fileURLWithPath: "NMMS.pdf"))!
print("PAGES:", d.pageCount)
for i in 0..<d.pageCount { print("=== PAGE \(i+1) ==="); print(d.page(at: i)?.string ?? "") }
