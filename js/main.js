Box = Backbone.Model.extend({
   defaults: {
      "aspectRatio": false,
      "top": 48,
      "left": 0,
      "height": 500,
      "width": 500
   }
})

BoxCollection = Backbone.Collection.extend({
   model: Box,
   // Получить самую нижнюю границу
   getLowest: function(){
      return _.max(this.models, function(box){
         return box.get('top') + box.get('height');
      })
   }
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
      this.$el.offset({top: this.model.get('top')});
      this.$('img').hide().one('load', this.setImageSize.bind(this)); // Скрываем картинку пока не установим ей разер, чтобы не дергалось
      this.$el
      .draggable({
         stop: this.onDragStop.bind(this),
         drag: this.notifyToCheckHeight.bind(this)
      })
      .resizable({
         aspectRatio: this.model.get('aspectRatio'),
         stop: this.onResizeEnd.bind(this),
         resize: this.notifyToCheckHeight.bind(this),
         handles: {
            'ne': '#negrip',
            'se': '#segrip',
            'sw': '#swgrip',
            'nw': '#nwgrip'
         }
      })
      return this;
   },
   // Подгоняет размеры контейнера под размеры изображения
   setImageSize: function() {
      // Делаем максимальную велечину равной 500px
      var MAX_VAL = 500;
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
   },
   // Конец перемещения. Записать данные в модель
   onDragStop: function(event, jqEvent) {
      this.model.set('top', parseInt(jqEvent.position.top));
      this.model.set('left', parseInt(jqEvent.position.left));
   },
   // Конец ресайза. Записать данные в модель
   onResizeEnd: function(event, jqEvent) {
      this.model.set('height', parseInt(jqEvent.size.height));
      this.model.set('width', parseInt(jqEvent.size.width));
   },
   notifyToCheckHeight: function() {
      this.$el.trigger('boxDrag', arguments);
   }
})

MainView = Backbone.View.extend({
   el: $('#main'),
   events: {
      'click #addImage': 'addImage',
      'click #addVideo': 'addVideo',
      'change #addImageInput': 'readFile',
      'boxDrag .box_draggable': 'checkHeight'
   },
   initialize: function(){
      this.$el.height(window.innerHeight);
   },
   // Добавить изображение
   addImage: function() {
      this.$('#addImageInput').trigger('click');
   },
   // Получение постера видео по ссылке на видео
   addVideo: function() {
      var rickRoll = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      var url = prompt("Please enter youtube video URL", rickRoll);

      if (url) {
         // Получение ID видео из ссылки
         var videoId = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();

         if (videoId.length === 11) {
            var thumbnail = 'https://img.youtube.com/vi/' + videoId + '/0.jpg';

            this.addBox(new Box({
               src: thumbnail,
               aspectRatio: false
            }));
         }
      }
   },
   // Добавляет экземпляр BoxView
   addBox: function(box) {
      var boxView = new BoxView({
         model: box
      });

      var lowestBox = this.collection.getLowest();
      if (lowestBox instanceof Box) {
         boxView.model.set('top', lowestBox.get('top') + lowestBox.get('height'));
      }

      this.collection.add(boxView.model);

      this.$('#container').append(boxView.render().el);
   },
   // Загрузка картинки
   readFile: function(event) {
      var input = event.target;
      var self = this;

      if (input.files && input.files[0] && input.files[0].type.includes('image')) {
         var reader = new FileReader();

         reader.onload = function(e) {
            $(input).val(""); // Чтобы change срабатывал на один и тот же файл

            self.addBox(new Box({
               src: e.target.result,
               aspectRatio: true
            }))
         }

         reader.readAsDataURL(input.files[0]);
      }
   },
   // Установка высоты основного View
   checkHeight: function(boxEvent, event, jqEvent){
      var bottom = jqEvent.helper.position().top + jqEvent.helper.height();

      if (bottom > this.$el.height()){
         this.$el.height(bottom);
      }
   }
})

boxes = new BoxCollection();
App = new MainView({
   collection: boxes
});
