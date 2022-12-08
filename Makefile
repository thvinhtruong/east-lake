up:
	docker-compose up
build:
	docker-compose build
down:
	docker-compose down
restart:
	make build
	make up
install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt
run:
	cd frontend && npm start
	cd backend && uvicorn main:app --host localhost --port 8088 --reload