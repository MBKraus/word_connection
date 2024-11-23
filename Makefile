
run:
	python -m http.server

encode:
	base64 -i content/aggregated_topics.json -o content/data.txt
	base64 -i auth.json -o auth.txt