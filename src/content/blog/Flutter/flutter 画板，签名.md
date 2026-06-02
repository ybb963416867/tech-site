---
title: "flutter 画板，签名"
description: "![在这里插入图片描述](https://imgblog.csdnimg.cn/abf6e35414414163a979f274e95b9c03.png)"
pubDate: 2026-06-01
category: "Flutter"
tags: [Notes]
draft: false
---
```dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'dart:ui' as ui;

class SignatureWidget extends StatefulWidget {
  final SignatureWidgetControl? signatureControl;

  ///画笔的颜色
  final Color color;

  /// 线条的宽
  final double strokeWidth;

  /// 生成图片的边距
  final double padding;

  const SignatureWidget(
      {Key? key,
      required this.signatureControl,
      this.color = Colors.black,
      this.strokeWidth = 2,
      this.padding = 10})
      : super(key: key);

  @override
  State<SignatureWidget> createState() => _SignatureWidgetState();
}

class SignatureWidgetControl {
  Function()? _reset;
  Future<Uint8List?> Function()? _onSave;
  Function()? _previousStep;

  /// 重置画布
  void reset() {
    _reset?.call();
  }

  /// 保存画布到图片
  Future<Uint8List?> onSave() {
    return _onSave?.call() ?? Future.value(null);
  }

  ///上一步
  void previousStep() {
    _previousStep?.call();
  }
}

class _SignatureWidgetState extends State<SignatureWidget> {
  List<Path?> paths = [];
  Path? _currentPath;
  Offset? _previousPosition;
  Uint8List? image;
  Paint p = Paint();

  @override
  void initState() {
    super.initState();

    p
      ..color = widget.color
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke
      ..strokeWidth = widget.strokeWidth
      ..isAntiAlias = true;

    widget.signatureControl?._reset = () {
      setState(() {
        paths.clear();
      });
    };

    widget.signatureControl?._previousStep = () {
      setState(() {
        paths.removeAt(paths.length - 1);
      });
    };

    widget.signatureControl?._onSave = () => _save();
  }

  Future<Uint8List?> _save() async {
    Rect? maxBound;
    for (var value in paths) {
      var bound = value?.getBounds();
      if (maxBound == null) {
        maxBound = bound;
      } else {
        maxBound = bound?.expandToInclude(maxBound);
      }
    }

    if (maxBound == null) {
      return null;
    }

    var recorder = ui.PictureRecorder();
    var canvas = Canvas(recorder);
    for (var path in paths) {
      if (path != null) {
        var shiftPath = path.shift(Offset(
            widget.padding - maxBound.left, widget.padding - maxBound.top));
        canvas.drawPath(shiftPath, p);
      }
    }
    var endRecording = recorder.endRecording();

    var image = await endRecording.toImage(
        (maxBound.size.width + widget.padding * 2).toInt(),
        (maxBound.size.height + widget.padding * 2).toInt());
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    return byteData?.buffer.asUint8List();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanDown: (e) {
        _currentPath = Path()..moveTo(e.localPosition.dx, e.localPosition.dy);
        _previousPosition = e.localPosition;
        paths.add(_currentPath);
      },
      onPanUpdate: (e) {
        if (_previousPosition == null) {
          _currentPath?.lineTo(e.localPosition.dx, e.localPosition.dy);
        } else {
          _currentPath?.quadraticBezierTo(
              _previousPosition!.dx,
              _previousPosition!.dy,
              (_previousPosition!.dx + e.localPosition.dx) / 2,
              (_previousPosition!.dy + e.localPosition.dy) / 2);
        }

        _previousPosition = e.localPosition;

        setState(() {});
      },
      onPanEnd: (e) {
        _previousPosition = null;
        setState(() {});
      },
      child: CustomPaint(
        painter: SignaturePainter(paths: paths, sPaint: p),
        size: Size.infinite,
        child: Container(
          color: Colors.transparent,
        ),
      ),
    );
  }
}

class SignatureAllWidget extends StatefulWidget {
  const SignatureAllWidget({Key? key}) : super(key: key);

  @override
  State<SignatureAllWidget> createState() => _SignatureAllWidgetState();
}

class _SignatureAllWidgetState extends State<SignatureAllWidget> {
  SignatureWidgetControl? signatureWidgetControl;

  @override
  void initState() {
    super.initState();
    signatureWidgetControl = SignatureWidgetControl();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        SignatureWidget(
          signatureControl: signatureWidgetControl,
          padding: 20,
          strokeWidth: 20,
          color: Colors.blue,
        ),
        SignatureDealWidget(signatureWidgetControl: signatureWidgetControl)
      ],
    );
  }
}

class SignatureDealWidget extends StatefulWidget {
  final SignatureWidgetControl? signatureWidgetControl;

  const SignatureDealWidget({Key? key, required this.signatureWidgetControl})
      : super(key: key);

  @override
  State<SignatureDealWidget> createState() => _SignatureDealWidgetState();
}

class _SignatureDealWidgetState extends State<SignatureDealWidget> {
  Uint8List? image;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Align(
          alignment: Alignment.bottomCenter,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              ElevatedButton(
                  onPressed: () {
                    var futureSave = widget.signatureWidgetControl?.onSave();
                    futureSave?.then((value) => {
                          setState(() {
                            image = value;
                          })
                        });
                  },
                  child: const Text("保存")),
              ElevatedButton(
                  onPressed: () {
                    widget.signatureWidgetControl?.reset();
                  },
                  child: const Text("清除")),
              ElevatedButton(
                  onPressed: () {
                    widget.signatureWidgetControl?.previousStep();
                  },
                  child: const Text("上一步")),
            ],
          ),
        ),
        Align(
          alignment: Alignment.topLeft,
          child: image == null
              ? const SizedBox()
              : Align(
                  alignment: Alignment.topLeft,
                  child: SizedBox(
                    width: 100,
                    height: 200,
                    child: Container(
                      decoration:
                          BoxDecoration(border: Border.all(color: Colors.blue)),
                      child: Image.memory(image!),
                    ),
                  ),
                ),
        )
      ],
    );
  }
}

class SignaturePainter extends CustomPainter {
  List<Path?> paths;
  Paint sPaint;

  SignaturePainter({required this.paths, required this.sPaint});

  @override
  void paint(Canvas canvas, Size size) {
    for (var value in paths) {
      _drawLine(canvas, value);
    }
  }

  void _drawLine(Canvas canvas, Path? path) {
    if (path == null) return;
    canvas.drawPath(path, sPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/abf6e35414414163a979f274e95b9c03.png)
