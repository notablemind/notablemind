

docker-node:
	mkdir -p /tmp/empty-ctx
	cp Docker.node /tmp/empty-ctx
	docker build -t jaredly/node -f /tmp/empty-ctx/Docker.node /tmp/empty-ctx
	rm -rf /tmp/empty-ctx

docker:
	docker build -t jaredly/nm -f Dockerfile ../


# .PHONY: ${B_COMPS}


