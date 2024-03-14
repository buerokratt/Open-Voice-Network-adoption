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
                const valueRegex = /"value":"((?:\\.|[^"\\])*)"/;
                const match = JSON.parse(JSON.stringify(text)).match(valueRegex);
                const value = match ? match[1] : null;
                const answer = value.replaceAll('\\"','').replaceAll('\\','');
                res.json(answer);
            });
        })
        .then((data) => {
        })
        .catch((error) => {
        });
});

export default router;
