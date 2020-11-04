// English stop words

// Lifted from Lucene:
// https://github.com/apache/lucene-solr/blob/master/lucene/core/src/java/org/apache/lucene/analysis/standard/StandardAnalyzer.java
const luceneStopwords = [
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'but',
	'by',
	'for',
	'if',
	'in',
	'into',
	'is',
	'it',
	'no',
	'not',
	'of',
	'on',
	'or',
	'such',
	'that',
	'the',
	'their',
	'then',
	'there',
	'these',
	'they',
	'this',
	'to',
	'was',
	'will',
	'with'
];

// Additional words that have tenuous emojis
const additionalStopwords = [
	'has',
	'have',
	'here',
	'like',
	'me',
	'so',
	'up',
	'us',
	'what',
	'you'
];

export default new Set(luceneStopwords.concat(additionalStopwords));

