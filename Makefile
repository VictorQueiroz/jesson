test:
	TS_NODE_PROJECT=test/tsconfig.json \
		npx sarg \
		--bail \
		--require ts-node/register \
		"test/**/*.ts"

.PHONY: test