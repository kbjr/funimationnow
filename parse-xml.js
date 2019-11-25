
const { parse } = require('fast-xml-parser');
const { readFileSync, writeFileSync } = require('fs');

const xml = readFileSync('./data.xml', 'utf8');
const parsed = parse(xml, {
	attributeNamePrefix: '',
	attrNodeName: 'attr',
	textNodeName: '#text',
	ignoreAttributes: false,
	parseAttributeValue: true
});

const json = JSON.stringify(parsed);

writeFileSync('./data.json', json, 'utf8');
