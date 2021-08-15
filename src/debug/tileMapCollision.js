// debug for collision shapes made in tiled for tilemap
function layerLoop(layer) {
    var graphics = this.add.graphics();
    
    console.log(this);

    this.physics.add.collider(layer, this.playerSprite, () => {
      console.log("hit layer");
    });

    // Loop over each tile and visualize its collision shape (if it has one)
    layer.forEachTile(function (tile, tileSet) {
      var tileWorldPos = layer.tileToWorldXY(tile.x, tile.y);
      var collisionGroup = tileSet.getTileCollisionGroup(tile.index);
      //console.log(collisionGroup);

      if (!collisionGroup || collisionGroup.objects.length === 0) {
        return;
      }

      // You can assign custom properties to the whole collision object layer (or even to
      // individual objects within the layer). Here, use a custom property to change the color of
      // the stroke.
      if (
        collisionGroup.properties &&
        collisionGroup.properties.isInteractive
      ) {
        graphics.lineStyle(5, 0x00ff00, 1);
      } else {
        graphics.lineStyle(5, 0x00ffff, 1);
      }

      // The group will have an array of objects - these are the individual collision shapes
      var objects = collisionGroup.objects;

      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var objectX = tileWorldPos.x + object.x;
        var objectY = tileWorldPos.y + object.y;

        // When objects are parsed by Phaser, they will be guaranteed to have one of the
        // following properties if they are a rectangle/ellipse/polygon/polyline.
        if (object.rectangle) {
          graphics.strokeRect(
            objectX,
            objectY,
            object.width * 2,
            object.height * 2
          );
          //testRect = scene.add.rectangle(objectX,objectY, object.width * 2, object.height * 2, 0xfff);
        } else if (object.ellipse) {
          // Ellipses in Tiled have a top-left origin, while ellipses in Phaser have a center
          // origin
          graphics.strokeEllipse(
            objectX + object.width /*/ 2*/,
            objectY + object.height /*/ 2*/,
            object.width * 2,
            object.height * 2
          );
        } else if (object.polygon || object.polyline) {
          var originalPoints = object.polygon
            ? object.polygon
            : object.polyline;
          var points = [];
          for (var j = 0; j < originalPoints.length; j++) {
            var point = originalPoints[j];
            points.push({
              x: objectX + point.x,
              y: objectY + point.y,
            });
          }
          graphics.strokePoints(points);
        }
      }
    });
  }

  export default layerLoop;