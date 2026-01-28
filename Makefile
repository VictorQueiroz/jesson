test:
	npm exec -- mocha --require tsx/cjs test/**/*.test.ts

.PHONY: test