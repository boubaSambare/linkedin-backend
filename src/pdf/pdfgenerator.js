const PdfPrinter = require('pdfmake');
const path = require('path')
const fs = require('fs-extra')

pdfGenerator = (response) => {
    new Promise((resolve, reject) => {
        try {
            console.log("pdf")
            var fonts = {
                Roboto: {
                    normal: "Helvetica",
                    bold: "Helvetica-Bold",
                    italics: "Helvetica-Oblique",
                    bolditalics: "Helvetica-BoldOblique"
                }
            };
            var printer = new PdfPrinter(fonts);
            var pdf = {
                content: [{
                        image: 'data:image/jpeg;base64,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',
                        width: 30,
                        alignment: 'right'
                    },
                    {
                        text: `${response.firstName} ${response.lastName}`,
                        style: 'header'
                    },
                    {
                        text: `Contact`,
                        style: 'subheader'
                    },
                    {
                        text: `Email: ${response.email}`,
                        style: 'small'
                    },
                    {
                        text: `Experiences`,
                        style: 'subheader'
                    },
                    {
                        text: response.experience.map(experience =>
                            experience.role + " " + experience.company + " " + experience.area + "\n\n" 
                        ),
                        style: 'small'
                    }
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: 10
                    },
                    subheader: {
                        fontSize: 13,
                        bold: true,
                        margin: 10
                    },
                    small: {
                        fontSize: 8,
                        margin: 10,
                        marginLeft: 20
                    }
                }
            }

            var pdfDoc = printer.createPdfKitDocument(pdf);
            pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `${response._id}.pdf`)));
            pdfDoc.end();
            resolve()
        } catch (e) {
            console.log(e)
            reject(e)
        }
    })
}



module.exports = pdfGenerator