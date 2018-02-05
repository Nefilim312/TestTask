Box = Backbone.Model.extend({

})

BoxCollection = Backbone.Collection.extend({
  model: Box
})

BoxView = Backbone.View.extend({
  tagName: 'img',
  initialize: function() {
    _.bindAll(this, 'render');
    this.model.bind('change', this.render);
    this.model.view = this;
  },
  render: function(){
    console.log('BoxViewRender');
    this.el.src = this.model.get('src');
    this.el.height = 300;
    this.el.width = 300;
    return this;
  }
})

MainView = Backbone.View.extend({
  el: $('#main'),
  events: {
    'click #addImage': 'addImage',
    'click #addVideo': 'addVideo',
    'change #addImageInput': 'readURL'
  },
  initialize: function() {
    this.collection.on('add', this.addVideo, this);
  },
  render: function() {
    console.log('MainViewRender');
    this.collection.each(this.addVideo, this);
    return this;
  },
  addImage: function(box) {
    this.$('#addImageInput').trigger('click');
  },
  addVideo: function(box) {
    console.log('addVideo');
    var boxView = new BoxView({model: box});
    this.$('#container').append($(boxView.render().el).draggable())
  },
  readURL: function(event) {
    var input = event.target;
    var self = this;

    if (input.files && input.files[0] && input.files[0].type.includes('image')) {
      var reader = new FileReader();

      reader.onload = function(e) {
        self.collection.add( new Box({
          src: e.target.result
        }))
        // $('#blah')
        //   .attr('src', e.target.result)
        //   .width(300)
        //   .height(300);
      };

      reader.readAsDataURL(input.files[0]);
    }
  }
})

Boxes = new BoxCollection([
  {src: 'https://yt3.ggpht.com/-dcBh0pHnxS8/AAAAAAAAAAI/AAAAAAAAAAA/IjOqcL9bAXg/s88-c-k-no-mo-rj-c0xffffff/photo.jpg'}
]);
App = new MainView({collection: Boxes});
App.render();
