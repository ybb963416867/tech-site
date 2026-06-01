---
title: "Flutter Canvas"
description: "构造"
pubDate: 2026-06-01
category: "Flutter"
tags: [API]
draft: false
---
# Canvas 绘图

## CustomPaint组件

> 构造

    class CustomPaint extends SingleChildRenderObjectWidget {
      /// Creates a widget that delegates its painting.
      const CustomPaint({
        super.key,
        this.painter,
        this.foregroundPainter,
        this.size = Size.zero,
        this.isComplex = false,
        this.willChange = false,
        super.child,
      })

*   painter:绘制的对象，是一个CustomPainter。它的绘制是在child之前。如果设置了child，该painter绘制的内容会被覆盖。
*   foregroundPainter:绘制的对象，是一个CustomPainter。它的绘制是在child之后。如果设置了child，该painter绘制的内容会覆盖child。
*   size: 画板大小，如果定义了child，则会以child的尺寸为准
*   isComplex: 默认值是false，定义绘制内容是否复杂，如果为true，会对canvas的绘制进行一些必要的缓存来优化性能
*   willChange: 默认值是false，配合isComplex使用，控制组件是否在下一帧需要重绘
*   child: 子节点，可以不设置

## CustomPainter 组件

> CustomPainter是一个抽象类，其构造函数如下

    const CustomPainter({ Listenable? repaint })

*   repaint: 是一个Listenable，一般用于动画时，传入一个监听来控制canvas组件的重绘
*   void paint(Canvas canvas, Size size)

> 这个是我们定义painter时必须实现的方法，其中canvas就是提供出我们绘制的核心，size是告诉我们画板的大小（通过CustomPaint的size或者child确定）

*   bool shouldRepaint(covariant CustomPainter oldDelegate)

> 返回 true 才会进行重绘，否则就只会绘制一次。你可以通过一些条件判断来决定是否每次绘制，这样能够节约系统资源。(注：有时候不管这里返回的是false还是true，外面的变化也能导致重新绘制，这里为什么是这样，后面的文章会给出解释)

## Paint

> Paint画笔

*   isAntiAlias: 是否抗锯齿
*   color: 画笔颜色
*   strokeWidth: 画笔宽度
*   style: 样式
    *   PaintingStyle.fill 默认 填充
    *   PaintingStyle.stroke 线
*   strokeCap: 定义画笔端点形状
    *   StrokeCap.butt 无形状(默认)
    *   StrokeCap.round 圆形
    *   StrokeCap.square 正方形
*   strokeJoin: 定义线段交接时的形状
    *   StrokeJoin.miter 默认，当两条线段夹角小于30°时，StrokeJoin.miter将会变成StrokeJoin.bevel  夹角的形状为尖角
    *   StrokeJoin.bevel 夹角的形状是平的
    *   StrokeJoin.round 夹角的形状为圆的
*   strokeMiterLimit: 当strokeJoin为StrokeJoin.miter时且style为PaintingStyle.stroke有效，用来设置连接线的长度，一般可用strokeJoin来替换
*   imageFilter: 设置模糊度
    *   ImageFilter.blur({double sigmaX = 0.0, double sigmaY = 0.0, TileMode tileMode = TileMode.clamp}): sigmaX与sigmaY在0\~10之间，数值越大越模糊
    *   ImageFilter.matrix 使用matrix来创建模糊度
    *   ImageFilter.compose 组合两个ImageFilter
*   invertColors: 反转画笔颜色（跟设置的color有关）
*   blendMode: 混合模式，两个形状混合时使用的模式，具体可参考blendMode，默认为BlendMode.srcOver
*   shader: 着色器
*   maskFilter: 模糊蒙版滤镜，比如绘制一些阴影效果或者艺术字等
*   filterQuality: 设置滤镜（如maskFilter或者image）的质量
*   colorFilter: 彩色矩阵滤色器，可以通过设置此属性改变画笔颜色如黑白色

## Path

| 方法名            | 作用                      |
| -------------- | ----------------------- |
| moveTo         | 将路径起始点移动到指定的位置          |
| relativeMoveTo | 相对于当前位置移动到              |
| lineTo         | 从当前位置连接指定点              |
| relativeLineTo | 相对当前位置连接到               |
| arcTo          | 曲线                      |
| conicTo        | 贝塞尔曲线                   |
| add\*\*        | 添加其他图形，如addArc，在路径是添加圆弧 |
| contains       | 路径上是否包括某点               |
| transfor       | 给路径做matrix4变换           |
| combine        | 结合两个路径                  |
| close          | 关闭路径，连接路径的起始点           |
| reset          | 重置路径，恢复到默认状态            |

**Path路径api 详解**

*   void moveTo(double x, double y)

> 设置画笔开始的位置

*   external void relativeLineTo(double dx, double dy)

> 与lineTo类似，不过传入的是相对于上一个点为原点的位置，比如上一个点是在(100,100)，传入的是(150,150)，如果用lineTo要达到同样效果应该传入(250,250)。

*   lineTo

> 绘制的下一个位置，传入的是相对于坐标系的具体位置，会按照代码顺序进行移动绘制

*   void arcTo(Rect rect, double startAngle, double sweepAngle, bool forceMoveTo)

> 此方法同drawArc类似，前三个参数都一样，最后一个参数表示是否跟path之前的绘制（如通过lineTo绘制的线段）相连，false表示连接，true表示不相连。

*   void quadraticBezierTo(double x1, double y1, double x2, double y2)

<!---->

    var path = Path();
    path.moveTo(50, 500);
    path.quadraticBezierTo(100, 300, 350, 300);
    canvas.drawPath(path1, paint);

*   void conicTo(double x1, double y1, double x2, double y2, double w)

> 同样也是绘制二阶贝塞尔曲线，但是同quadraticBezierTo相比，它多了一个参数w，用于控制曲线的弧度。当 w < 1 时，曲线弧度更小；w = 1 时同quadraticBezierTo效果一样；w > 1 时，弧度更大

*   void cubicTo(double x1, double y1, double x2, double y2, double x3, double y3)

> 三阶贝塞尔曲线相比二阶贝塞尔曲线只是多了一个点

*   addRect(Rect.fromLTRB(50, 50, 350, 350));

> 绘制一个矩形区域

*   addRRect

> 绘制一个带圆角的矩形

    RRect rRect = RRect.fromLTRBR(100, 100, 350, 350, Radius.circular(30));
    path.addRRect(rRect);

*   addArc

> 绘制一个圆弧

    Path path = new Path();
    // 画一个矩形区域
    Rect rect = Rect.fromCircle(
        center: Offset(size.width / 2, size.height / 2), radius: 100);
    canvas.drawRect(rect, paint);
    // 在矩形区域画圆弧
    path.addArc(rect, 90 * (pi / 180), 90 * (pi / 180));
    paint.color = Colors.red;
    canvas.drawPath(path, paint);

*   addOval

> 绘制一个椭圆

    Rect pRect = Rect.fromLTRB(50, 150, 400, 350);
    path.addOval(pRect);
    canvas.drawPath(path, paint);

*   void addPolygon(List points, bool close)

> 通过点绘制线段
> point: 传入多个点的位置
> close: 为true时最后一个点会和第一个点相连

    Path path = new Path();
    path.addPolygon([
          Offset(100, 100),
          Offset(250, 180),
          Offset(200, 300),
        ], false);
    canvas.drawPath(path, paint);

*   PathMetrics computeMetrics({bool forceClosed = false})

> computeMetrics方法用于返回一个之前绘制的路径的一份快照。当我们使用moveTo、lineTo、arcTo、conicTo等绘制路径时，可以使用此来实现只绘制其中一部分。

    var path = Path();
    path.moveTo(50, 500);
    path.cubicTo(50, 200, 300, 400, 350, 150);
    // 将完整绘制图形置为红色
    paint.color = Colors.red;
    canvas.drawPath(path, paint);
    ui.PathMetrics pathMetrics = path.computeMetrics();
    // 绘制一半
    var progress = 0.5;
    // 将颜色更改为紫色用于区分
    paint.color = Colors.deepPurple;
    for (ui.PathMetric pathMetric in pathMetrics) {
      Path extractPath = pathMetric.extractPath(
        0.0,
        pathMetric.length * progress,
      );
      canvas.drawPath(extractPath, paint);
    }

*   void extendWithPath(Path path, Offset offset, {Float64List matrix4})

> 用于复制一份之前绘制的路径并平移offset的位置，原路径会和新路径连接。matrix4是对新路径进行一个4D矩阵处理。

    var path = Path();
    path.moveTo(50, 500);
    // 绘制一个三阶贝塞尔曲线
    path.cubicTo(50, 200, 300, 400, 350, 150);
    // 处理
    path.extendWithPath(path, Offset(50, 30),
        matrix4: Float64List.fromList(
            [1, 0, 0, 0, .1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2]));
    canvas.drawPath(path, paint);

*   Path shift(Offset offset)

> 可用于复制之前绘制的路径并平移offset位置，返回Path。与extendWithPath不同的是，此方法仅仅是复制路径，不会跟原路径相连。

    var path = Path();
    path.moveTo(50, 500);
    path.cubicTo(50, 200, 300, 400, 350, 150);

    // 原始图形为红色
    paint.color = Colors.red;
    canvas.drawPath(path, paint);
    // 复制原路径并平移
    var path2 = path.shift(Offset(50,20));
    paint.color = Colors.yellow;
    canvas.drawPath(path2, paint);

*   void close()

> 用于将路径起点与终点连接起来

*   void drawShadow(Path path, Color color, double elevation, bool transparentOccluder)

> 绘制阴影
> path 绘制阴影的路径,
> color 绘制阴影的颜色,
> elevation 绘制阴影的范围,
> transparentOccluder   是否填充path

    var path = Path()
      ..moveTo(50.0, 50.0)
      ..lineTo(300.0, 50.0)
      ..lineTo(300.0, 200.0)
      ..lineTo(50.0, 200.0)
      ..close();
    canvas.drawShadow(path, Colors.blue, 3, false);
    // 向下平移到200 elevation设置为10
    canvas.drawShadow(path.shift(Offset(0, 200)), Colors.blue, 10, false);
    // 向下移动到400 transparentOccluder设置为true效果
    canvas.drawShadow(path.shift(Offset(0, 400)), Colors.blue, 10, true);

*   void drawCircle(Offset c, double radius, Paint paint)

> 绘制圆
> c 绘制的圆心位置
> radius 绘制圆半径

    canvas.drawCircle(Offset(200,200), 100, paint);

*   void drawDRRect(RRect outer, RRect inner, Paint paint)

> outer 外部形状，由一个RRect构成（为啥是RRect，因为RRect几乎涵盖了所有的闭合形状，如矩形、正方形、圆角矩形、椭圆、圆）
> inner 内部形状

    // 画个圆角矩形
    RRect rrect = RRect.fromRectXY(
        Rect.fromCircle(center: Offset(200, 200), radius: 150), 20.0, 40.0);
    // 画个圆
    RRect rrect1 = new RRect.fromRectXY(
        Rect.fromCircle(center: Offset(200, 200), radius: 80), 100.0, 100.0);
    canvas.drawDRRect(rrect, rrect1, paint);

## Canvas

**Canvas详解**

*   save()

> 操作会保存此前的所有绘制内容和 Canvas 状态。

*   restore()

> 在调用 save() 或者 saveLayer() 必须调用 restore() 来合成，否则 Flutter 会抛出异常。
> 值得注意的是，每一个 save() 或者 saveLayer() 都必须有一个对应的 restore()。

*   saveLayer()

> saveLayer() 在大多数情况下看起来和 save() 的效果是差不多的。
> 不同的是 saveLayer() 会创建一个新的图层。
> 在 saveLayer() 到 restore() 之间的操作，是在新的图层上进行的，虽然最终它们还是会合成到一起。rect Rect，用于设置新图层的范围区域。你的绘制操作只有在这个区域内才会有效，超过这个区域的部分会被忽略

*   translate()

> 平移

*   scale()

> 用于将画布进行缩放

*   rotate()

> 画布的旋转

*   void drawPicture(Picture picture)

> 将Picture 绘制到画布上 Picture 对象通过 PictureRecorder 来生成

    import 'package:flutter/material.dart';
    import 'dart:ui';

    class CustomImage extends StatefulWidget {
      const CustomImage({Key? key}) : super(key: key);

      @override
      State<CustomImage> createState() => _CustomImageState();
    }

    class _CustomImageState extends State<CustomImage> {
      Picture? picture;

      Future<Picture> _generatePicture() async {
        var p = PictureRecorder();
        var paint = Paint()
          ..isAntiAlias = true
          ..strokeWidth = 2
          ..style = PaintingStyle.fill
          ..strokeCap = StrokeCap.round
          ..color = Colors.red;

        var paintRect = Paint()
          ..isAntiAlias = true
          ..strokeWidth = 2
          ..style = PaintingStyle.fill
          ..strokeCap = StrokeCap.round
          ..color = Colors.white;

        var rect = const Rect.fromLTRB(10, 20, 190, 300);
        var canvas = Canvas(p, rect);
        canvas.drawRect(rect, paintRect);
        canvas.drawCircle(const Offset(100, 160), 80, paint);

        canvas.save();
        canvas.translate(190, 0);
        canvas.drawRect(rect, paintRect);
        canvas.drawCircle(const Offset(100, 160), 80, paint);

        // canvas.restore();
        // canvas.translate(0, 290);
        // canvas.drawRect(rect, paintRect);
        // canvas.drawCircle(const Offset(100, 160), 80, paint);
        //
        // canvas.save();
        // canvas.translate(190, 0);
        // canvas.drawRect(rect, paintRect);
        // canvas.drawCircle(const Offset(100, 160), 80, paint);

        var endRecording = p.endRecording();
        var f = Future.value(endRecording);
        return f;
      }

      @override
      Widget build(BuildContext context) {
        return CustomPaint(
          foregroundPainter: ImagePainter(picture: picture),
          child: Container(
            color: Colors.yellow,
            child: Align(
              alignment: Alignment.bottomCenter,
              child: ElevatedButton(
                onPressed: () {
                  var generatePicture = _generatePicture();
                  generatePicture.then((value) => picture = value);

                  setState(() {});
                },
                child: const Text("生成图片"),
              ),
            ),
          ),
        );
      }
    }

    class ImagePainter extends CustomPainter {
      Picture? picture;

      ImagePainter({required this.picture});

      @override
      void paint(Canvas canvas, Size size) {
        if (picture != null) {
          canvas.drawPicture(picture!);
        }
      }

      @override
      bool shouldRepaint(covariant CustomPainter oldDelegate) {
        return true;
      }
    }

<img src="https://img-blog.csdnimg.cn/ba91626ee98944b188094b3c44d2559b.png" width="200" height="400" />

