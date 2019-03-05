const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const url = require('url')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/results', (req, res) => res.render('pages/results'))
  .get('/getRate', (req, res) => {
  	var params = url.parse(req.url, true)
  	var weight = params.query.weight
  	var type = params.query.type
  	params.query.price = weight * calcRate(weight, type)
  	console.log(params.query)
  	res.render('pages/results', params.query)
  })
  //tutorial stuff
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .use(express.static(__dirname)) 
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

calcRate = (weight, type) => {
	switch (type) {
		case 'Letters(stamped)':
			var weights = [1, 2, 3, 3.5]
			var prices = [.55, .70, .85, 1.00]
			return rate_price(weight, weights, prices)
			break
		case 'Letters(Metered)':
			var weights = [1, 2, 3, 3.5]
			var prices = [.50, .65, .80, .95]
			return rate_price(weight, weights, prices)
			break
		case 'Large Envelopes(Flats)':
			var weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
			var prices = [1.00, 1.15, 1.30, 1.45, 1.60, 1.75, 1.90, 2.05, 2.20, 2.35, 2.50, 2.65, 2.80]
			return rate_price(weight, weights, prices)
			break
		case 'First-Class Package Service--Retail':
			var weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
			var prices = [3.60, 3.60, 3.60, 3.60, 3.78, 3.96, 4.14, 4.32, 4.50, 4.68, 4.86, 5.04, 5.22]
			return rate_price(weight, weights, prices)
			break
	}

}

rate_price = (weight, weights, prices) => {
	for (let i = 0; i < weights.length; i++) {
		console.log(weights[i] + " " + weight)
		if (weight < weights[i]) {
			return prices[i]
		}
	}
	return prices[prices.length - 1]
}

//tutorial stuff
showTimes = () => {
  let result = ''
  const times = process.env.TIMES || 5
  for (i = 0; i < times; i++) {
    result += i + ' '
  }
  return result;
}