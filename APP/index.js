var express = require('express');
var promClient = require('prom-client');
var app = express();
const register = new promClient.Registry();

const counter = new promClient.Counter({
  name: 'aula_requests_total',
  help: 'Contados de requests',
  registers: [register],
  labelNames: ['statusCode'],
});

const gauge = new promClient.Gauge({ 
    name: 'aula_free_bytes', 
    help: 'Exemplo de gauge',
    registers: [register] 
});

const histogram = new promClient.Histogram({
    name: 'aula_request_time_seconds',
    help: 'Tempo de resposta da API',
    buckets: [0.1, 0.2, 0.3, 0.4, 0.5],
    registers: [register] 
});

const summary = new promClient.Summary({
    name: 'aula_summary_request_time_seconds',
    help: 'Tempo de resposta da API',
    percentiles: [0.5, 0.9, 0.99],
    registers: [register]
  });

app.get('/', function(req, res) {
    counter.labels('200').inc();
    counter.labels('300').inc();
    gauge.set(100 * Math.random());
    const tempo = Math.random();
    histogram.observe(tempo);
    summary.observe(tempo);

    res.send('Hello World!');
});

app.get('/metrics', async function(req, res) {
    try {
        const metrics = await register.metrics();
        res.set('Content-Type', register.contentType);
        res.end(metrics);
    } catch (error) {
        console.error('Erro ao obter métricas:', error);
        res.status(500).send('Erro ao obter métricas');
    }
});



const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});