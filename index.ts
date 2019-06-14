import * as express from "express";
import * as cors from "cors";
import * as fileUpload from 'express-fileupload';
const fs = require('fs');

const port = 3080;

const run = async () => {
    const app = express();
    app.use(cors());

    app.use(fileUpload({
        limits: { fileSize: 500 * 1024 * 1024 }
    }));

    if (!fs.existsSync('models')) {
        fs.mkdirSync('models');
    }
    app.use('/models', express.static('models'));
    app.post('/models/:model', (
            req, res
        ) => {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        const modelPath = 'models/' + req.params.model;
        if (!fs.existsSync(modelPath)) {
            fs.mkdirSync(modelPath, { recursive: true });
        }

        const errs = [];
        for (let fileKey in req.files) {
            const file = req.files[fileKey] as fileUpload.UploadedFile;
            const filePath = modelPath + '/' + file.name;
            
            file.mv(filePath, (err) => {
                if (err) {
                    console.log(err);
                    errs.push(err);
                }
            });
            
        }
        if (errs.length > 0 ) {
            res.status(500).send(errs);
        } else {
            res.send('ok!');
        }
    });

    app.get('/', (req, res) => {
        res.json({msg: 'This is CORS-enabled for all origins!'})
    })

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
    
    // await client.end();
};

run();