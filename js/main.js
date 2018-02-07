Box = Backbone.Model.extend({
   defaults: {
      "aspectRatio": false,
      "top": 0,
      "left": 0,
      "height": 500,
      "width": 500
   }
})

BoxCollection = Backbone.Collection.extend({
   model: Box
})

BoxView = Backbone.View.extend({
   events: {
      'load': 'setImageSize'
   },
   className: 'box_draggable box_grey',
   template: _.template($('#boxTemplate').html()),
   initialize: function() {
      this.model.view = this;
   },
   render: function() {
      this.$el.html(this.template(this.model));
      this.$('img').hide().one('load', this.setImageSize.bind(this)); // Скрываем картинку пока не установим ей разер, чтобы не дергалось
      return this;
   },
   setImageSize: function() {
      // Делаем максимальную велечину равной 500px
      var MAX_VAL = 200;
      var height, width;
      var img = this.$('img')[0];

      // Устанавливаем новые размеры на основе MAX_VAL
      if (img.width >= img.height && img.width > MAX_VAL) {
         width = MAX_VAL;
         height = img.height * (MAX_VAL / img.width);
      } else if (img.height > img.width && img.height > MAX_VAL) {
         height = MAX_VAL;
         width = img.width * (MAX_VAL / img.height);
      } else {
         height = img.height;
         width = img.width;
      }

      this.model.set('height', height);
      this.model.set('width', width);

      // Делаем серый блок размером с картинку
      // С анимацией чтобы не было дёргания
      this.$el.animate({
            height: height,
            width: width
         }, 150)
         // this.$el.width(width).height(height);

      this.$('img').fadeIn();

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
      var rickRoll = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      var url = prompt("Please enter youtube video URL", rickRoll);

      if (url) {
         // Получение ID видео из ссылки
         var videoId = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();

         if (videoId.length === 11) {
            var thumbnail = 'https://img.youtube.com/vi/' + videoId + '/0.jpg';
            this.collection.add(new Box({
               src: thumbnail,
               aspectRatio: true
            }))
         }
      }
   },
   addBox: function(box) {
      var boxView = new BoxView({
         model: box
      });
      this.$('#container').append($(boxView.render().el).draggable().resizable({
         aspectRatio: box.get('aspectRatio'),
         handles: {
            'ne': '#negrip',
            'se': '#segrip',
            'sw': '#swgrip',
            'nw': '#nwgrip'
         }
      }))
   },
   readURL: function(event) {
      var input = event.target;
      var self = this;

      if (input.files && input.files[0] && input.files[0].type.includes('image')) {
         var reader = new FileReader();

         reader.onload = function(e) {
            self.collection.add(new Box({
               src: e.target.result,
               aspectRatio: false
            }))
         };

         reader.readAsDataURL(input.files[0]);
      }
   }
})

boxes = new BoxCollection();
App = new MainView({
   collection: boxes
});
