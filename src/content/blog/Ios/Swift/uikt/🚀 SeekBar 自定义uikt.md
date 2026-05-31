---
title: "SeekBar 自定义uikt"
description: "SeekBar 自定义uikt 的技术笔记。"
pubDate: 2026-05-29
category: "uikt"
tags: [Swift]
draft: false
---
```

//
//  SeekBar.swift
//  wscanner
//
//  Created by yunshen on 2025/9/29.
//

import Foundation
import UIKit

extension SeekBar {
    public func setValueRange(_ minValue: CGFloat, maxValue: CGFloat) {
        valueRange = minValue...maxValue
    }

    public func setHandleViewHidden() {
        handleView.isHidden = true
    }

    public func setValue(_ value: CGFloat) {
        self.value = value.clamped(to: valueRange)
        updateViews()
    }

    public func setBufferedValue(_ bufferedValue: CGFloat) {
        self.bufferedValue = bufferedValue.clamped(to: valueRange)
        updateViews()
    }

    public func setInactiveTrackColor(_ color: UIColor) {
        inactiveTrackColor = color
        inactiveTrackView.backgroundColor = inactiveTrackColor
    }

    public func setBufferedTrackColor(_ color: UIColor) {
        bufferedTrackColor = color
        bufferedTrackView.backgroundColor = bufferedTrackColor
    }

    public func setActiveTrackColor(_ color: UIColor) {
        activeTrackColor = color
        activeTrackView.backgroundColor = activeTrackColor
    }

    public func setHandleColor(_ color: UIColor) {
        handleColor = color
        handleView.backgroundColor = handleColor
    }

}

public class SeekBar: UIView {
    private var value: CGFloat = 0.5
    private var bufferedValue: CGFloat = 0.0
    private var valueRange: ClosedRange<CGFloat> = 0...1
    private var step: CGFloat = 0.000001
    private var onTrackingChanged: ((Bool) -> Void)?
    private var onTrackingValueChange: ((CGFloat) -> Void)?
    private var currentValueProgress: CGFloat = 0

    private let inactiveTrackView = UIView()
    private let bufferedTrackView = UIView()
    private let activeTrackView = UIView()
    private let handleView = UIView()

    private var dragStartOffset: CGFloat = 0
    private var isDragging: Bool = false

    private var defaultTrackHeight: CGFloat = 4.0  // 默认轨道高度
    private var enlargedTrackHeight: CGFloat = 8.0  // 按下时放大的轨道高度
    private var trackHeight: CGFloat = 4.0  // 当前轨道高度
    private var defaultHandleSize: CGFloat = 12.0  // 默认手柄大小
    private var enlargedHandleSize: CGFloat = 24.0  // 按下时放大的手柄大小
    private var handleSize: CGFloat = 12.0  // 当前手柄大小
    private var defaultTrackCornerRadius: CGFloat = 2.0  // 默认轨道圆角
    private var enlargedTrackCornerRadius: CGFloat = 4.0  // 按下时放大的轨道圆角
    private var inactiveTrackCornerRadius: CGFloat = 2.0  // 当前圆角
    private var bufferedTrackCornerRadius: CGFloat = 2.0  // 当前圆角
    private var activeTrackCornerRadius: CGFloat = 2.0  // 当前圆角
    private var inactiveTrackColor: UIColor = .gray
    private var bufferedTrackColor: UIColor = .lightGray
    private var activeTrackColor: UIColor = .white
    private var handleColor: UIColor = .white

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
        setupGestures()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
        setupGestures()
    }

    convenience init(
        value: CGFloat,
        bufferedValue: CGFloat = 0,
        defaultTrackHeight: CGFloat = 4.0,
        enlargedTrackHeight: CGFloat = 8.0,
        defaultHandleSize: CGFloat = 12.0,
        enlargedHandleSize: CGFloat = 24.0,
        defaultTrackCornerRadius: CGFloat = 2.0,
        enlargedTrackCornerRadius: CGFloat = 4.0,
        range: ClosedRange<CGFloat> = 0...1,
        step: CGFloat = 0.000001,
        onTrackingChanged: ((Bool) -> Void)? = nil,
        onTrackingValueChange: ((CGFloat) -> Void)? = nil
    ) {
        self.init(frame: .zero)
        self.value = value.clamped(to: range)
        self.defaultHandleSize = defaultTrackHeight
        self.enlargedTrackHeight = enlargedTrackHeight
        self.defaultHandleSize = defaultHandleSize
        self.enlargedHandleSize = enlargedHandleSize
        self.defaultTrackCornerRadius = defaultTrackCornerRadius
        self.enlargedTrackCornerRadius = enlargedTrackCornerRadius
        self.bufferedValue = bufferedValue.clamped(to: range)
        self.valueRange = range
        self.step = step
        self.onTrackingChanged = onTrackingChanged
        self.onTrackingValueChange = onTrackingValueChange
        updateViews()
    }

    private func setupViews() {
        inactiveTrackView.backgroundColor = inactiveTrackColor
        inactiveTrackView.layer.cornerRadius = inactiveTrackCornerRadius
        addSubview(inactiveTrackView)

        bufferedTrackView.backgroundColor = bufferedTrackColor
        bufferedTrackView.layer.cornerRadius = bufferedTrackCornerRadius
        addSubview(bufferedTrackView)

        activeTrackView.backgroundColor = activeTrackColor
        activeTrackView.layer.cornerRadius = activeTrackCornerRadius
        addSubview(activeTrackView)

        handleView.backgroundColor = handleColor
        handleView.layer.cornerRadius = handleSize / 2
        addSubview(handleView)

        isUserInteractionEnabled = true
    }

    private func setupGestures() {
        let panGesture = UIPanGestureRecognizer(
            target: self,
            action: #selector(handlePan(_:))
        )
        addGestureRecognizer(panGesture)

        let tapGesture = UITapGestureRecognizer(
            target: self,
            action: #selector(handleTap(_:))
        )
        addGestureRecognizer(tapGesture)
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        updateViews()
    }

    private func updateViews() {
        let availableWidth = frame.width - handleSize

        inactiveTrackView.frame = CGRect(
            x: handleSize / 2,
            y: (frame.height - trackHeight) / 2,
            width: availableWidth,
            height: trackHeight
        )
        inactiveTrackView.layer.cornerRadius = inactiveTrackCornerRadius

        bufferedTrackView.frame = CGRect(
            x: handleSize / 2,
            y: (frame.height - trackHeight) / 2,
            width: calculatePosition(
                for: bufferedValue,
                within: valueRange,
                with: availableWidth
            ),
            height: trackHeight
        )
        bufferedTrackView.layer.cornerRadius = bufferedTrackCornerRadius

        activeTrackView.frame = CGRect(
            x: handleSize / 2,
            y: (frame.height - trackHeight) / 2,
            width: calculatePosition(
                for: value,
                within: valueRange,
                with: availableWidth
            ),
            height: trackHeight
        )
        activeTrackView.layer.cornerRadius = activeTrackCornerRadius

        handleView.frame = CGRect(
            x: calculatePosition(
                for: value,
                within: valueRange,
                with: availableWidth
            ),
            y: (frame.height - handleSize) / 2,
            width: handleSize,
            height: handleSize
        )
        handleView.layer.cornerRadius = handleSize / 2
    }

    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let availableWidth = frame.width - handleSize

        switch gesture.state {
        case .began:
            isDragging = true
            onTrackingChanged?(true)
            // 放大手柄和轨道，并调整圆角
            animateHandleAndTrack(
                toHandleSize: enlargedHandleSize,
                toTrackHeight: enlargedTrackHeight,
                toTrackCornerRadius: enlargedTrackCornerRadius
            )
            let startLocation = gesture.location(in: self).x
            dragStartOffset =
                startLocation
                - calculatePosition(
                    for: value,
                    within: valueRange,
                    with: availableWidth
                )
        case .changed:
            let location = gesture.location(in: self).x
            updateValue(
                for: location - dragStartOffset,
                availableWidth: availableWidth
            )
            if currentValueProgress != value {
                onTrackingValueChange?(value)
                currentValueProgress = value
            }
        case .ended, .cancelled:
            isDragging = false
            dragStartOffset = 0
            onTrackingChanged?(false)
            // 恢复手柄和轨道大小及圆角
            animateHandleAndTrack(
                toHandleSize: defaultHandleSize,
                toTrackHeight: defaultTrackHeight,
                toTrackCornerRadius: defaultTrackCornerRadius
            )
        default:
            break
        }
    }

    @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
        let availableWidth = frame.width - handleSize
        let location = gesture.location(in: self).x
        updateValue(for: location, availableWidth: availableWidth)
        onTrackingChanged?(true)
        // 放大手柄和轨道，并调整圆角
        animateHandleAndTrack(
            toHandleSize: enlargedHandleSize,
            toTrackHeight: enlargedTrackHeight,
            toTrackCornerRadius: enlargedTrackCornerRadius
        )
        if currentValueProgress != value {
            onTrackingValueChange?(value)
            currentValueProgress = value
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.onTrackingChanged?(false)
            // 恢复手柄和轨道大小及圆角
            self?.animateHandleAndTrack(
                toHandleSize: self?.defaultHandleSize ?? 12.0,
                toTrackHeight: self?.defaultTrackHeight ?? 4.0,
                toTrackCornerRadius: self?.defaultTrackCornerRadius ?? 2.0
            )
        }
    }

    private func animateHandleAndTrack(
        toHandleSize: CGFloat,
        toTrackHeight: CGFloat,
        toTrackCornerRadius: CGFloat
    ) {
        UIView.animate(
            withDuration: 0.2,
            animations: { [weak self] in
                guard let self = self else { return }
                self.handleSize = toHandleSize
                self.trackHeight = toTrackHeight
                self.inactiveTrackCornerRadius = toTrackCornerRadius
                self.bufferedTrackCornerRadius = toTrackCornerRadius
                self.activeTrackCornerRadius = toTrackCornerRadius
                self.updateViews()
            }
        )
    }

    private func updateValue(for position: CGFloat, availableWidth: CGFloat) {
        let newValue = normalizedValue(
            for: position,
            within: valueRange,
            with: availableWidth,
            step: step
        )
        value = newValue
        updateViews()
    }

    private func calculatePosition(
        for value: CGFloat,
        within range: ClosedRange<CGFloat>,
        with availableWidth: CGFloat
    ) -> CGFloat {
        let normalized =
            (value - range.lowerBound) / (range.upperBound - range.lowerBound)
        return normalized * availableWidth
    }

    private func normalizedValue(
        for position: CGFloat,
        within range: ClosedRange<CGFloat>,
        with availableWidth: CGFloat,
        step: CGFloat
    ) -> CGFloat {
        let normalized = position / availableWidth
        var newValue =
            range.lowerBound + normalized
            * (range.upperBound - range.lowerBound)
        newValue = max(range.lowerBound, min(range.upperBound, newValue))

        if step > 0 {
            let steps = round((newValue - range.lowerBound) / step)
            newValue = range.lowerBound + steps * step
        }

        return newValue
    }

    var currentValue: CGFloat {
        return value
    }

    var maximumValue: CGFloat {
        return valueRange.upperBound
    }

    var minimumValue: CGFloat {
        return valueRange.lowerBound
    }
}

extension CGFloat {
    func clamped(to range: ClosedRange<CGFloat>) -> CGFloat {
        return Swift.max(range.lowerBound, Swift.min(range.upperBound, self))
    }
}

```