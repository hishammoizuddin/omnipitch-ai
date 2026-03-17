export function exportDeckAsPdf(containerId: string, fileLabel: string) {
    const previewNode = document.getElementById(containerId);
    if (!previewNode) {
        return;
    }

    const safeTitle = (fileLabel || 'Executive Deck').replace(/[<>]/g, '').trim() || 'Executive Deck';

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1440,height=960');
    if (!printWindow) {
        return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');

    printWindow.document.write(`
        <html>
            <head>
                <title>${safeTitle} PDF Export</title>
                ${styles}
                <style>
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }

                    html, body {
                        margin: 0;
                        background: white;
                        color: #0f172a;
                    }

                    body {
                        padding: 16px;
                        font-family: "Avenir Next", "Segoe UI", sans-serif;
                    }

                    .print-deck-root {
                        display: grid;
                        gap: 20px;
                    }

                    .preview-slide {
                        box-shadow: none !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body>
                <div class="print-deck-root">${previewNode.innerHTML}</div>
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener('afterprint', () => {
        printWindow.close();
    });
    setTimeout(() => {
        printWindow.print();
    }, 250);
}
