---
title: "UICollectionView 完整API和属性指南"
description: "UICollectionView是iOS开发中用于展示网格布局或自定义布局的集合视图控件，比UITableView更加灵活，支持多列布局和复杂的自定义布局。"
pubDate: 2026-05-29
category: "uikt"
tags: [Git, Mac, iOS, Swift, API]
draft: false
---
# 🚀 UICollectionView 完整API和属性指南

## 概述

UICollectionView是iOS开发中用于展示网格布局或自定义布局的集合视图控件，比UITableView更加灵活，支持多列布局和复杂的自定义布局。

## 初始化方法

### 构造器

```swift
// 使用布局对象初始化
init(frame: CGRect, collectionViewLayout layout: UICollectionViewLayout)

// 使用编码器初始化（用于Storyboard/XIB）
init?(coder: NSCoder)
```

## 核心属性

### 数据源和代理

```swift
// 数据源协议，负责提供cell数据
weak var dataSource: UICollectionViewDataSource?

// 代理协议，处理用户交互和布局配置
weak var delegate: UICollectionViewDelegate?

// 预取数据源，用于性能优化
weak var prefetchDataSource: UICollectionViewDataSourcePrefetching?

// 是否启用预取功能
var isPrefetchingEnabled: Bool
```

### 布局相关

```swift
// 集合视图的布局对象
var collectionViewLayout: UICollectionViewLayout

// 设置布局（可带动画效果）
func setCollectionViewLayout(_ layout: UICollectionViewLayout, animated: Bool)
func setCollectionViewLayout(_ layout: UICollectionViewLayout, animated: Bool, completion: ((Bool) -> Void)?)

// 开始交互式布局转换
func startInteractiveTransition(to layout: UICollectionViewLayout, completion: UICollectionViewLayoutInteractiveTransitionCompletion?) -> UICollectionViewTransitionLayout

// 完成交互式转换
func finishInteractiveTransition()
func cancelInteractiveTransition()
```

### 外观和行为属性

```swift
// 背景视图
var backgroundView: UIView?

// 选择相关
var allowsSelection: Bool           // 是否允许选择
var allowsMultipleSelection: Bool   // 是否允许多选
var selectionFollowsFocus: Bool     // 选择是否跟随焦点

// 记住焦点状态
var remembersLastFocusedIndexPath: Bool

// 弹跳效果
var alwaysBounceVertical: Bool      // 垂直方向始终可以弹跳
var alwaysBounceHorizontal: Bool    // 水平方向始终可以弹跳

// 键盘处理
var keyboardDismissMode: UIScrollView.KeyboardDismissMode

// 内容触摸延迟
var delaysContentTouches: Bool      // 是否延迟内容触摸
var canCancelContentTouches: Bool   // 是否可以取消内容触摸

// 自动调整内容偏移
@available(iOS 11.0, *)
var contentInsetAdjustmentBehavior: UIScrollView.ContentInsetAdjustmentBehavior

// 安全区域相关
@available(iOS 11.0, *)
var adjustedContentInset: UIEdgeInsets
```

### 滚动相关

```swift
// 继承自UIScrollView的滚动属性
var contentOffset: CGPoint          // 内容偏移量
var contentSize: CGSize             // 内容大小
var contentInset: UIEdgeInsets      // 内容边距

// 滚动指示器
var showsVerticalScrollIndicator: Bool      // 显示垂直滚动指示器
var showsHorizontalScrollIndicator: Bool    // 显示水平滚动指示器
var indicatorStyle: UIScrollView.IndicatorStyle  // 滚动指示器样式

// 滚动行为
var isScrollEnabled: Bool           // 是否启用滚动
var isPagingEnabled: Bool           // 是否启用分页
var scrollsToTop: Bool              // 是否支持点击状态栏滚动到顶部
var bounces: Bool                   // 是否启用弹跳效果

// 缩放相关
var minimumZoomScale: CGFloat       // 最小缩放比例
var maximumZoomScale: CGFloat       // 最大缩放比例
var zoomScale: CGFloat              // 当前缩放比例
var bouncesZoom: Bool               // 缩放时是否启用弹跳

// 滚动到指定位置
func scrollToItem(at indexPath: IndexPath, at scrollPosition: UICollectionView.ScrollPosition, animated: Bool)

// 滚动相关方法
func setContentOffset(_ contentOffset: CGPoint, animated: Bool)
func scrollRectToVisible(_ rect: CGRect, animated: Bool)

// 停止滚动
func setContentOffset(_ contentOffset: CGPoint, animated: Bool)

// 缩放方法
func setZoomScale(_ scale: CGFloat, animated: Bool)
func zoom(to rect: CGRect, animated: Bool)
```

## Cell和视图管理

### 注册Cell和视图

```swift
// 注册cell类
func register(_ cellClass: AnyClass?, forCellWithReuseIdentifier identifier: String)

// 注册cell的XIB
func register(_ nib: UINib?, forCellWithReuseIdentifier identifier: String)

// 注册补充视图类（header/footer）
func register(_ viewClass: AnyClass?, forSupplementaryViewOfKind elementKind: String, withReuseIdentifier identifier: String)

// 注册补充视图XIB
func register(_ nib: UINib?, forSupplementaryViewOfKind elementKind: String, withReuseIdentifier identifier: String)
```

### 获取可重用的Cell和视图

```swift
// 获取可重用的cell
func dequeueReusableCell(withReuseIdentifier identifier: String, for indexPath: IndexPath) -> UICollectionViewCell

// 获取可重用的补充视图
func dequeueReusableSupplementaryView(ofKind elementKind: String, withReuseIdentifier identifier: String, for indexPath: IndexPath) -> UICollectionReusableView
```

### 获取Cell和视图信息

```swift
// 获取指定位置的cell
func cellForItem(at indexPath: IndexPath) -> UICollectionViewCell?

// 获取所有可见的cells
var visibleCells: [UICollectionViewCell]

// 获取所有可见cells的indexPaths
func indexPathsForVisibleItems() -> [IndexPath]

// 根据cell获取其indexPath
func indexPath(for cell: UICollectionViewCell) -> IndexPath?

// 根据点获取indexPath
func indexPathForItem(at point: CGPoint) -> IndexPath?
```

## 数据管理

### 刷新数据

```swift
// 重新加载所有数据
func reloadData()

// 重新加载指定的items
func reloadItems(at indexPaths: [IndexPath])

// 重新加载指定的sections
func reloadSections(_ sections: IndexSet)
```

### 批量更新

```swift
// 执行批量更新操作
func performBatchUpdates(_ updates: (() -> Void)?, completion: ((Bool) -> Void)?)

// 插入sections
func insertSections(_ sections: IndexSet)

// 删除sections
func deleteSections(_ sections: IndexSet)

// 移动section
func moveSection(_ section: Int, toSection newSection: Int)

// 插入items
func insertItems(at indexPaths: [IndexPath])

// 删除items
func deleteItems(at indexPaths: [IndexPath])

// 移动item
func moveItem(at indexPath: IndexPath, to newIndexPath: IndexPath)
```

### 数据查询

```swift
// 获取sections数量
var numberOfSections: Int

// 获取指定section中items的数量
func numberOfItems(inSection section: Int) -> Int

// 检查指定indexPath是否有效
func hasUncommittedUpdates: Bool

// 获取所有可见补充视图
func visibleSupplementaryViews(ofKind elementKind: String) -> [UICollectionReusableView]

// 获取所有可见补充视图的indexPaths
func indexPathsForVisibleSupplementaryElements(ofKind elementKind: String) -> [IndexPath]

// 根据补充视图获取其indexPath
func indexPath(for supplementaryView: UICollectionReusableView) -> IndexPath?

// 获取指定位置的补充视图
func supplementaryView(forElementKind elementKind: String, at indexPath: IndexPath) -> UICollectionReusableView?
```

## 编辑和交互

### 编辑状态

```swift
// 是否处于编辑状态
var isEditing: Bool

// 设置编辑状态
func setEditing(_ editing: Bool, animated: Bool)

// 允许多选时的编辑
var allowsSelectionDuringEditing: Bool
var allowsMultipleSelectionDuringEditing: Bool
```

### 上下文菜单（iOS 13+）

```swift
@available(iOS 13.0, *)
weak var contextMenuDelegate: UICollectionViewContextMenuDelegate?
```

### 刷新控制

```swift
// 下拉刷新控件
var refreshControl: UIRefreshControl?
```

### 选择状态

```swift
// 获取所有选中items的indexPaths
var indexPathsForSelectedItems: [IndexPath]?

// 选中指定item
func selectItem(at indexPath: IndexPath?, animated: Bool, scrollPosition: UICollectionView.ScrollPosition)

// 取消选中指定item
func deselectItem(at indexPath: IndexPath, animated: Bool)
```

## 布局信息

### 获取布局信息

```swift
// 获取指定item的布局属性
func layoutAttributesForItem(at indexPath: IndexPath) -> UICollectionViewLayoutAttributes?

// 获取指定补充视图的布局属性
func layoutAttributesForSupplementaryElement(ofKind kind: String, at indexPath: IndexPath) -> UICollectionViewLayoutAttributes?

// 获取指定区域内的所有布局属性
func layoutAttributesForElements(in rect: CGRect) -> [UICollectionViewLayoutAttributes]?
```

## 通知

### UICollectionView相关通知

```swift
// 布局即将失效通知
static let UICollectionViewLayoutInvalidated: NSNotification.Name

// 内容偏移量改变通知（继承自UIScrollView）
static let UIScrollViewDidScrollNotification: NSNotification.Name
static let UIScrollViewDidZoomNotification: NSNotification.Name
static let UIScrollViewDidEndScrollingAnimationNotification: NSNotification.Name
static let UIScrollViewDidEndDeceleratingNotification: NSNotification.Name
static let UIScrollViewDidEndDraggingNotification: NSNotification.Name
static let UIScrollViewWillBeginDraggingNotification: NSNotification.Name
static let UIScrollViewWillBeginDeceleratingNotification: NSNotification.Name
static let UIScrollViewWillBeginZoomingNotification: NSNotification.Name
static let UIScrollViewDidEndZoomingNotification: NSNotification.Name
```

## 辅助类和结构体

### IndexPath扩展

```swift
// UICollectionView为IndexPath提供的扩展
extension IndexPath {
    // 便捷初始化方法
    init(item: Int, section: Int)
    
    // 获取item索引
    var item: Int { get }
}
```

### 拖拽相关

```swift
// 拖拽代理
weak var dragDelegate: UICollectionViewDragDelegate?

// 放置代理
weak var dropDelegate: UICollectionViewDropDelegate?

// 拖拽交互是否启用
var dragInteractionEnabled: Bool

// 重排序手势
var reorderingCadence: UICollectionView.ReorderingCadence

// 开始交互式移动
func beginInteractiveMovementForItem(at indexPath: IndexPath) -> Bool

// 更新交互式移动
func updateInteractiveMovementTargetPosition(_ targetPosition: CGPoint)

// 结束交互式移动
func endInteractiveMovement()

// 取消交互式移动
func cancelInteractiveMovement()
```

## 焦点管理（tvOS）

### 焦点相关属性

```swift
// 记住最后聚焦的indexPath
var remembersLastFocusedIndexPath: Bool

// 选择是否跟随焦点
var selectionFollowsFocus: Bool
```

## UICollectionView\.ScrollPosition 枚举

```swift
struct ScrollPosition: OptionSet {
    static let top = ScrollPosition(rawValue: 1 << 0)                    // 滚动到顶部
    static let centeredVertically = ScrollPosition(rawValue: 1 << 1)     // 垂直居中
    static let bottom = ScrollPosition(rawValue: 1 << 2)                 // 滚动到底部
    static let left = ScrollPosition(rawValue: 1 << 3)                   // 滚动到左侧
    static let centeredHorizontally = ScrollPosition(rawValue: 1 << 4)   // 水平居中
    static let right = ScrollPosition(rawValue: 1 << 5)                  // 滚动到右侧
}
```

## UICollectionView\.ReorderingCadence 枚举

```swift
@available(iOS 11.0, *)
enum ReorderingCadence: Int {
    case immediate  // 立即重排序
    case fast       // 快速重排序
    case slow       // 缓慢重排序
}
```

## 补充视图种类常量

```swift
// UICollectionView元素种类常量
extension UICollectionView {
    static let elementKindSectionHeader: String     // Section Header
    static let elementKindSectionFooter: String     // Section Footer
}
```

## 异常和错误处理

### 常见异常

```swift
// 当尝试访问无效indexPath时抛出的异常
NSInternalInconsistencyException

// 批量更新时数据不一致的异常
NSInternalInconsistencyException: "Invalid update"
```

## 主要代理协议方法

### UICollectionViewDataSource

```swift
// 必需方法
func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int
func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell

// 可选方法
func numberOfSections(in collectionView: UICollectionView) -> Int
func collectionView(_ collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView
func collectionView(_ collectionView: UICollectionView, canMoveItemAt indexPath: IndexPath) -> Bool
func collectionView(_ collectionView: UICollectionView, moveItemAt sourceIndexPath: IndexPath, to destinationIndexPath: IndexPath)
```

### UICollectionViewDataSourcePrefetching

```swift
// 预取数据源协议
protocol UICollectionViewDataSourcePrefetching {
    // 预取指定indexPaths的数据
    func collectionView(_ collectionView: UICollectionView, prefetchItemsAt indexPaths: [IndexPath])
    
    // 取消预取（可选）
    func collectionView(_ collectionView: UICollectionView, cancelPrefetchingForItemsAt indexPaths: [IndexPath])
}
```

### UICollectionViewDelegate

```swift
@available(iOS 11.0, *)
protocol UICollectionViewDragDelegate {
    // 必需方法：提供拖拽items
    func collectionView(_ collectionView: UICollectionView, itemsForBeginning session: UIDragSession, at indexPath: IndexPath) -> [UIDragItem]
    
    // 可选方法
    func collectionView(_ collectionView: UICollectionView, itemsForAddingTo session: UIDragSession, at indexPath: IndexPath, point: CGPoint) -> [UIDragItem]
    func collectionView(_ collectionView: UICollectionView, dragPreviewParametersForItemAt indexPath: IndexPath) -> UIDragPreviewParameters?
    func collectionView(_ collectionView: UICollectionView, dragSessionWillBegin session: UIDragSession)
    func collectionView(_ collectionView: UICollectionView, dragSessionDidEnd session: UIDragSession)
    func collectionView(_ collectionView: UICollectionView, dragSessionAllowsMoveOperation session: UIDragSession) -> Bool
    func collectionView(_ collectionView: UICollectionView, dragSessionIsRestrictedToDraggingApplication session: UIDragSession) -> Bool
}
```

### UICollectionViewDropDelegate（iOS 11+）

```swift
@available(iOS 11.0, *)
protocol UICollectionViewDropDelegate {
    // 必需方法：处理放置操作
    func collectionView(_ collectionView: UICollectionView, performDropWith coordinator: UICollectionViewDropCoordinator)
    
    // 可选方法
    func collectionView(_ collectionView: UICollectionView, canHandle session: UIDropSession) -> Bool
    func collectionView(_ collectionView: UICollectionView, dropSessionDidEnter session: UIDropSession)
    func collectionView(_ collectionView: UICollectionView, dropSessionDidUpdate session: UIDropSession, withDestinationIndexPath destinationIndexPath: IndexPath?) -> UICollectionViewDropProposal
    func collectionView(_ collectionView: UICollectionView, dropSessionDidExit session: UIDropSession)
    func collectionView(_ collectionView: UICollectionView, dropSessionDidEnd session: UIDropSession)
    func collectionView(_ collectionView: UICollectionView, dropPreviewParametersForItemAt indexPath: IndexPath) -> UIDragPreviewParameters?
}
// 选择相关
func collectionView(_ collectionView: UICollectionView, shouldSelectItemAt indexPath: IndexPath) -> Bool
func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath)
func collectionView(_ collectionView: UICollectionView, shouldDeselectItemAt indexPath: IndexPath) -> Bool
func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath)

// 高亮相关
func collectionView(_ collectionView: UICollectionView, shouldHighlightItemAt indexPath: IndexPath) -> Bool
func collectionView(_ collectionView: UICollectionView, didHighlightItemAt indexPath: IndexPath)
func collectionView(_ collectionView: UICollectionView, didUnhighlightItemAt indexPath: IndexPath)

// 显示相关
func collectionView(_ collectionView: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt indexPath: IndexPath)
func collectionView(_ collectionView: UICollectionView, willDisplaySupplementaryView view: UICollectionReusableView, forElementKind elementKind: String, at indexPath: IndexPath)
func collectionView(_ collectionView: UICollectionView, didEndDisplaying cell: UICollectionViewCell, forItemAt indexPath: IndexPath)
func collectionView(_ collectionView: UICollectionView, didEndDisplayingSupplementaryView view: UICollectionReusableView, forElementOfKind elementKind: String, at indexPath: IndexPath)
// 焦点相关（tvOS）
func collectionView(_ collectionView: UICollectionView, canFocusItemAt indexPath: IndexPath) -> Bool
func collectionView(_ collectionView: UICollectionView, shouldUpdateFocusIn context: UICollectionViewFocusUpdateContext) -> Bool
func collectionView(_ collectionView: UICollectionView, didUpdateFocusIn context: UICollectionViewFocusUpdateContext, with coordinator: UIFocusAnimationCoordinator)
func indexPathForPreferredFocusedView(in collectionView: UICollectionView) -> IndexPath?
// 菜单相关
func collectionView(_ collectionView: UICollectionView, shouldShowMenuForItemAt indexPath: IndexPath) -> Bool
func collectionView(_ collectionView: UICollectionView, canPerformAction action: Selector, forItemAt indexPath: IndexPath, withSender sender: Any?) -> Bool
func collectionView(_ collectionView: UICollectionView, performAction action: Selector, forItemAt indexPath: IndexPath, withSender sender: Any?)
// 编辑相关
func collectionView(_ collectionView: UICollectionView, targetIndexPathForMoveFromItemAt originalIndexPath: IndexPath, toProposedIndexPath proposedIndexPath: IndexPath) -> IndexPath
func collectionView(_ collectionView: UICollectionView, targetContentOffsetForProposedContentOffset proposedContentOffset: CGPoint) -> CGPoint

// Spring Loading（iOS 11+）
@available(iOS 11.0, *)
func collectionView(_ collectionView: UICollectionView, shouldSpringLoadItemAt indexPath: IndexPath, with context: UISpringLoadedInteractionContext) -> Bool
```

### UIScrollViewDelegate相关方法

```swift
// UICollectionView继承自UIScrollView，所以也支持UIScrollViewDelegate的所有方法
func scrollViewDidScroll(_ scrollView: UIScrollView)
func scrollViewWillBeginDragging(_ scrollView: UIScrollView)
func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>)
func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool)
func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView)
func scrollViewDidEndDecelerating(_ scrollView: UIScrollView)
func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView)
func scrollViewShouldScrollToTop(_ scrollView: UIScrollView) -> Bool
func scrollViewDidScrollToTop(_ scrollView: UIScrollView)
func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?)
func scrollViewDidEndZooming(_ scrollView: UIScrollView, with view: UIView?, atScale scale: CGFloat)
func scrollViewDidZoom(_ scrollView: UIScrollView)
func viewForZooming(in scrollView: UIScrollView) -> UIView?

// 尺寸相关
func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize
func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, referenceSizeForHeaderInSection section: Int) -> CGSize
func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, referenceSizeForFooterInSection section: Int) -> CGSize

// 间距相关
func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets
func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat
func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumInteritemSpacingForSectionAt section: Int) -> CGFloat

```

### 错误处理示例

```swift
// 安全地访问cell
guard let cell = collectionView.cellForItem(at: indexPath) else {
    print("Cell at indexPath \(indexPath) not found")
    return
}

// 批量更新的安全处理
collectionView.performBatchUpdates({
    // 更新数据源
    self.dataSource.removeItem(at: indexPath)
    // 删除UI中的item
    collectionView.deleteItems(at: [indexPath])
}, completion: { success in
    if !success {
        print("Batch update failed, reloading data")
        self.collectionView.reloadData()
    }
})
```

## 调试和诊断

### 调试相关属性和方法

```swift
// 获取当前未提交的更新状态
var hasUncommittedUpdates: Bool

// 调试布局问题的方法
func layoutAttributesForElements(in rect: CGRect) -> [UICollectionViewLayoutAttributes]?

// 验证布局的一致性（仅在调试模式下使用）
func _validateLayout()  // 私有API，不要在生产代码中使用
```

### 基本设置

```swift
class ViewController: UIViewController {
    @IBOutlet weak var collectionView: UICollectionView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 注册cell
        collectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: "Cell")
        
        // 设置数据源和代理
        collectionView.dataSource = self
        collectionView.delegate = self
        
        // 设置布局
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: 100, height: 100)
        layout.minimumLineSpacing = 10
        layout.minimumInteritemSpacing = 10
        collectionView.collectionViewLayout = layout
    }
}

extension ViewController: UICollectionViewDataSource {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 20
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "Cell", for: indexPath)
        cell.backgroundColor = .systemBlue
        return cell
    }
}

extension ViewController: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        print("Selected item at: \(indexPath)")
    }
}
```

### 批量更新示例

```swift
func updateData() {
    collectionView.performBatchUpdates({
        // 插入新items
        let newIndexPaths = [IndexPath(item: 0, section: 0)]
        collectionView.insertItems(at: newIndexPaths)
        
        // 删除items
        let deleteIndexPaths = [IndexPath(item: 5, section: 0)]
        collectionView.deleteItems(at: deleteIndexPaths)
        
        // 移动item
        collectionView.moveItem(at: IndexPath(item: 2, section: 0), 
                               to: IndexPath(item: 8, section: 0))
    }) { completed in
        print("Batch updates completed: \(completed)")
    }
}
```

## 性能优化建议

1.  **合理使用cell复用机制**，避免创建过多的cell实例
2.  **使用prefetchDataSource**进行数据预取，提升滚动性能
3.  **避免在cellForItemAt中进行复杂计算**，预先计算好数据
4.  **合理设置estimatedItemSize**，提升布局性能
5.  **使用批量更新**而不是多次调用单个更新方法
6.  **及时释放不需要的资源**，避免内存泄漏

## 总结

UICollectionView是一个功能强大且灵活的集合视图控件，通过合理使用其丰富的API和属性，可以实现各种复杂的布局需求。掌握其数据源、代理协议以及布局系统的使用是开发高质量iOS应用的重要技能。
