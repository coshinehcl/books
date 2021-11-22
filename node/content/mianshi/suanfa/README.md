# 常见排序算法

## 一、算法
```js
1、快速排序
2、插入排序
3、冒泡排序
4、选择排序
5、归并排序
```
```js
// 冒泡排序：一个个冒泡出来。
// 逻辑：两两对比，一轮下来后，最后面的就是最大的。如sort
function bubbleSort(arr) {
    var len = arr.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j+1]) {       // 相邻元素两两对比
                var temp = arr[j+1];       // 元素交换
                arr[j+1] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
}
```
```js
// 选择排序
// 每次选择出一个最大或最小的item。（怎么选择出来的呢，也就是从未排序的第一个开始，找出最小的一个。把最小的排序过来）
// 对比冒泡，是一直两两交换，这里是直接找最小的，一个个放好
// 如 5 7 2 9 6
// 第一轮：找到比第一个小的
//   2 7 5 9 6  // 此时排列好了第一个
// 第二轮，从未排列中继续找出最小的
//   2 5 7 9 6
//   2 5 6 9 7
//   2 5 6 7 9

function selectionSort(arr) {
    var len = arr.length;
    var minIndex, temp;
    for (var i = 0; i < len - 1; i++) {
        minIndex = i;
        // 找出最小的index。
        for (var j = i + 1; j < len; j++) {
            if (arr[j] < arr[minIndex]) {    // 寻找最小的数
                minIndex = j;                // 将最小数的索引保存
            }
        }
        // 排列到i。交换
        temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
    return arr;
} 
```
```js
// 插入排序
// 前面局部冒牌。后续再冒泡进来

```