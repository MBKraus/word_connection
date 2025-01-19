
run:
	python -m http.server

encode:
	python content/aggregator.py
	base64 -i content/aggregated_topics.json -o content/data.txt
	base64 -i auth.json -o auth.txt

print:
	python content/print.py

lighthouse:
	lighthouse http://localhost:8000 --view

lighthouse-url:
	lighthouse https://wordconnectionsgame.io --view
