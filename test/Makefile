
main:
	echo "hello"
	echo ${B_COMPS}

include ../common.mk

COMPS=$(wildcard components/*.js)
B_COMPS=$(patsubst %,build/%,${COMPS})

build/components/%.js: components/%.js
	if test -n "$$WATCH"; \
		then ${WAT} $< -o $@; \
		else ${BROW} $< -o $@; \
	fi;

# watch: ${B_COMPS}

# .PHONY: ${B_COMPS}


