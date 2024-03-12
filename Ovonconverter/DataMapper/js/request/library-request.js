import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    const requestBody = req.body;

    const url = "https://ovon.xcally.com/smartlibrary"

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
    };

    fetch(url, requestOptions)
        .then((response) => {
            response.text().then((text) => {
                console.log('LIBRARY RESPONSE: ')
                console.log(JSON.stringify(text))
                res.json(JSON.parse(JSON.stringify(text)));
            });
        })
        .then((data) => {
        })
        .catch((error) => {
        });
});

export default router;
