import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    const protocolVersion = req.body.protocol.protocol;
    let result = 'V0.3';
    // converts string with structure of ovon_0.3 to V0.3
    if(protocolVersion !== undefined) {
        result = 'V' + protocolVersion.split("_")[1];
    }
    res.json(result);
});

export default router;
