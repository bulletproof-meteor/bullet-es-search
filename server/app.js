// loading the npm module
ElasticSearch = Meteor.npmRequire('elasticsearch');

// create the connection
EsClientSource = new ElasticSearch.Client({
  host: 'localhost:9200'
});

// make it fiber aware 
EsClient = Async.wrap(EsClientSource, ['search', 'create']);

Entries = new Meteor.Collection('entries');

Meteor.methods({
  addEntry: function(name, phoneNo) {
    var id = Entries.insert({name: name, phoneNo: phoneNo});

    // create a document index Elastic Search
    EsClient.create({
      index: "myindex",
      type: "phonebook",
      id: id,
      body: {
        name: name,
        phoneNo: phoneNo
      }
    });
  }
});

Meteor.methods({
  getEntries: function(searchText) {
    var lastWord = searchText.trim().split(" ").splice(-1)[0];
    var query = {
      "bool": {
        "must": [
          {
            "bool": {
              "should": [
                {"match": {"name": {"query": searchText}}},
                {"prefix": {"name": lastWord}}
              ]
            }
          }
        ],
        "should": [
          {"match_phrase_prefix": {"name": {"query": searchText, slop: 5}}}
        ]
      }
    };

    var result =  EsClient.search({
      index: "myindex",
      type: "phonebook",
      body: {
        query: query
      }
    });

    return result.hits.hits.map(function(doc) {
      return doc._source;
    });
  }
});