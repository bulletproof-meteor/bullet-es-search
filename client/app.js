var Entries = new ReactiveVar([]);

AddEntry = function(name, phoneNo) {
  Meteor.call('addEntry', name, phoneNo);
};

Template.app.events({
  "click #search-button": function(event) {
    var searchText = $('#search-box').val();
    getEntries(searchText);
  },

  "keyup #search-box": _.throttle(function(ev) {
    var searchText = $('#search-box').val();
    getEntries(searchText);
  }, 1000)
});

Template.app.helpers({
  entries: function() {
    return Entries.get();
  },

  entryCount: function() {
    return Entries.get().length;
  }
});

Template.app.rendered = function() {
  getEntries('');
};

function getEntries(searchText) { 
  Meteor.call('getEntries', searchText, function(err, searchText) {
    if(err) {
      throw err;
    } else {
      Entries.set(searchText);
    }
  }); 
}