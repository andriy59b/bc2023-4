const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');

const app = express();
const port = 8000;

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

app.get('/', (req, res) => {
  fs.readFile('data.xml', 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const transformedData = {
        data: {
          indicators: result.indicators.basindbank.reduce((acc, item) => {
            if (item.parent && item.parent[0] === 'BS3_BanksLiab') {
              acc.push({
                txt: item.txten ? item.txten[0] : null,
                value: item.value ? item.value[0] : null,
              });
            }
            return acc;
          }, []),
        },
      };

      const xml = builder.buildObject(transformedData);

      res.set('Content-Type', 'application/xml');
      res.send(xml);
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

