Box = Backbone.Model.extend({

})

BoxCollection = Backbone.Collection.extend({
   model: Box
})

BoxView = Backbone.View.extend({
   events: {
      'load': 'setImageSize'
   },
   template: _.template($('#boxTemplate').html()),
   initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.model.view = this;
   },
   render: function() {
      this.$el.html(this.template(this.model));
      this.$('img').hide().one('load', this.setImageSize.bind(this)); // Скрываем картинку пока не установим ей разер, чтобы не дергалось
      return this;
   },
   setImageSize: function() {
      // Делаем максимальную велечину равной 500px
      var MAX_VAL = 500;
      var img = this.$('img');

      if (img.width() > img.height() && img.width() > MAX_VAL) {
         img.width(MAX_VAL);
      } else if (img.height() > MAX_VAL) {
         img.height(MAX_VAL);
      }
      img.show();

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
      this.collection.on('add', this.addBox, this);
   },
   render: function() {
      this.collection.each(this.addBox, this);
      return this;
   },
   addImage: function() {
      this.$('#addImageInput').trigger('click');
   },
   addVideo: function() {
      this.$('#addImageInput').trigger('click');
   },
   addBox: function(box) {
      var boxView = new BoxView({
         model: box
      });
      this.$('#container').append($(boxView.render().el).draggable())
   },
   readURL: function(event) {
      var input = event.target;
      var self = this;

      if (input.files && input.files[0] && input.files[0].type.includes('image')) {
         var reader = new FileReader();

         reader.onload = function(e) {
            self.collection.add(new Box({
               src: e.target.result
            }))
         };

         reader.readAsDataURL(input.files[0]);
      }
   }
})

boxes = new BoxCollection([{
   src: 'https://yt3.ggpht.com/-dcBh0pHnxS8/AAAAAAAAAAI/AAAAAAAAAAA/IjOqcL9bAXg/s88-c-k-no-mo-rj-c0xffffff/photo.jpg'
}]);
App = new MainView({
   collection: boxes
});
App.render();
