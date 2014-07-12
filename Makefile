
docs:
	@echo "Copying the build into the docs"
	@cd web && make all
	@cp -R web/* pages

