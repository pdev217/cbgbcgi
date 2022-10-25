const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const readXlsxFile = require('read-excel-file/node')

const app = express();
app.use(bodyParser.json()); 
app.use(cors());

const hostname = 'localhost';
const port = 3001;

app.post('/api/getExcelData', async (req, res) => {
    const { fileName } = req.body;
    console.log(fileName)
    readXlsxFile(`../public/metadata/${fileName}.xlsx`).then((rows, errors) => {
        res.send(rows)
    })
});

app.listen(port, hostname, function() {
    console.log(`Server running at http://${hostname}:${port}/`);
})