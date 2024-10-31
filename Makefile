
run:
	python -m http.server

encode:
	base64 -i data.json -o data.txt
	base64 -i auth.json -o auth.txt