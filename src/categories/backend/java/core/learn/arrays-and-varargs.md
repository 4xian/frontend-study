---
id: backend.java.learn.basics.arrays-and-varargs
type: lesson
title: 数组
summary: 声明、创建和遍历固定长度数组，理解默认值、索引边界、别名与可变参数的数组关系
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 60
prerequisites:
  - backend.java.learn.basics.parameter-passing
objectives:
  - 能区分数组类型、数组变量和数组对象，并用 new 或初始化器创建一维数组。
  - 能读取 length、按合法索引读写组件，并解释新数组的组件默认值。
  - 能根据是否需要位置，在索引循环和增强 for 之间做出选择。
  - 能解释数组变量复制的是引用值，并观察别名对同一数组组件的影响。
  - 能把二维数组理解为数组的数组，并按每一层的 length 访问不规则行。
  - 能声明数组参数和末尾 varargs 参数，并说明 varargs 在方法体内按数组使用。
recap:
  - 数组是组件类型相同、长度在创建时固定的对象；数组变量保存对它的引用。
  - 长度为 n 的数组只有 0 到 n - 1 的合法索引，length 本身不是最后一个索引。
  - 新数组组件先取得组件类型的默认值；初始化器可以在创建时提供具体值。
  - 需要位置时使用索引循环，只读逐项处理且不需要位置时使用增强 for。
  - 二维数组是数组的数组，各行可以有不同长度；每次访问要检查对应行的 length。
  - varargs 只能是最后一个参数，在方法体内表现为数组；Java 25 与 Java 8 的这些规则一致。
related: []
tags:
  - Java
  - 数组
  - 索引
  - length
  - 二维数组
  - varargs
appliesTo: JDK 25 主线；Java 8 在数组、索引、遍历与 varargs 位置保持相同语言合同
verifiedAt: 2026-08-17
sources:
  - id: jls-25-arrays
    title: Java Language Specification 25 - Arrays
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 数组是对象，组件类型相同，数组变量可以引用数组对象。
      - 数组长度在创建时确定，length 提供组件数量，索引从 0 到 length - 1。
      - 数组初始化器可以创建数组并为组件提供初始值，多维数组是数组的数组。
  - id: jls-25-array-default-values
    title: Java Language Specification 25 - Initial Values of Variables
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.5
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 新建数组的组件变量会取得与组件类型对应的默认值。
  - id: jls-25-enhanced-for
    title: Java Language Specification 25 - The enhanced for Statement
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 增强 for 执行时按顺序把数组组件值放入每轮的循环变量。
  - id: jls-25-varargs
    title: Java Language Specification 25 - Formal Parameters
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 25
    claims:
      - 可变参数只能出现在参数列表末尾，一个方法最多声明一个可变参数。
      - 可变参数在方法体内按数组类型使用，调用方可以提供零个或多个末尾实参。
  - id: dev-java-arrays
    title: Creating Arrays in Your Programs
    url: https://dev.java/learn/language-basics/arrays
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dev.java Java 入门资料
    claims:
      - 数组的固定长度、创建、元素访问、遍历和二维不规则数组入门示例。
  - id: dev-java-calling-methods
    title: Calling Methods and Constructors
    url: https://dev.java/learn/classes-objects/calling-methods-constructors
    sourceOrigin: official
    sourceType: official-reference
    appliesTo: Dev.java Java 入门资料
    claims:
      - varargs 可以接收任意数量的末尾值，也可以直接接收现成数组，方法体按数组处理。
  - id: jls-8-arrays
    title: Java Language Specification 8 - Arrays
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-10.html
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的数组创建、默认值、length、索引和多维数组合同与本课主线一致。
  - id: jls-8-varargs
    title: Java Language Specification 8 - Formal Parameters
    url: https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.1
    sourceOrigin: official
    sourceType: specification
    appliesTo: Java SE 8
    claims:
      - Java 8 的 varargs 只能位于参数列表末尾，调用时在方法体内按数组使用。
---

# 数组

当 TeamFlow 需要同时记录多个任务阶段、多个完成标记或一批同类数字时，只用一个变量不够：每个值
都需要一个位置，而且程序还要知道这批值有多少个。数组提供了这种固定长度、按整数索引访问的容器。

本课从一维数组开始，逐步建立创建、读写、遍历、别名和二维数组的心智模型，再说明数组如何作为方法
参数以及如何连接到末尾数量可变的 varargs。字符串、集合和复杂对象模型留给后续课程。

## 一、先建立数组心智模型

### 1. 数组类型、变量与对象

`int[]` 表示“组件类型为 `int` 的数组类型”。`int[] completed` 只是声明一个可以保存这种数组
引用的变量；真正的数组对象由 `new int[3]` 或数组初始化器创建。数组中的每个存储位置称为组件，
组件类型在创建后不会改变。

```java
public final class ArrayDeclarationExample {
    /**
     * 展示数组变量声明、创建与长度读取。
     */
    public static void main(String[] args) {
        int[] completed;
        completed = new int[3];
        System.out.println(completed.length);
    }
}
```

输出是 `3`。第一行只声明变量，第二行创建长度为 3 的数组对象，第三行读取对象的组件数量。

### 2. 长度固定，组件类型统一

数组创建时必须给出长度，或者给出初始化器中的全部值。创建完成后，数组长度不会因为写入或读取而
改变；写入只替换已有位置的组件值。下面两个数组长度都为 3：

```java
public final class ArrayCreationExample {
    /**
     * 输出显式长度数组与初始化器数组的长度。
     */
    public static void main(String[] args) {
        int[] created = new int[3];
        int[] initialized = {2, 3, 5};
        System.out.println(created.length + "|" + initialized.length);
    }
}
```

输出 `3|3`。`new int[3]` 直接指定长度，初始化器的长度由大括号中的三个值决定。

### 3. `length` 是数量，不是最后索引

长度为 `n` 的数组从索引 `0` 开始，到索引 `n - 1` 结束。长度为零的数组可以存在，但没有任何合法
组件索引。`length` 是数组对象提供的只读数量字段，不能把它当成一个可访问位置。

```java
public final class ArrayBoundaryExample {
    /**
     * 输出空数组和非空数组的长度。
     */
    public static void main(String[] args) {
        int[] empty = new int[0];
        int[] values = {4, 6, 8};
        System.out.println(empty.length + "|" + values.length + "|" + values[values.length - 1]);
    }
}
```

输出 `0|3|8`。`values.length - 1` 才是最后一个合法索引；`empty` 只有数量，没有可读取的组件。

## 二、创建、初始化与元素访问

### 1. 新数组的默认值

使用 `new` 创建数组后，每个组件先取得组件类型的默认值。`int` 的默认值是 `0`，`boolean` 的默认
值是 `false`，引用类型组件的默认值是 `null`。这与“局部数组变量必须先完成赋值”是两回事：
变量要先指向数组对象，数组对象内部的组件才会拥有默认值。

```java
public final class ArrayDefaultValueExample {
    /**
     * 观察新建数组中的整数和布尔默认值。
     */
    public static void main(String[] args) {
        int[] counts = new int[2];
        boolean[] flags = new boolean[1];
        System.out.println(counts[0] + "|" + flags[0]);
    }
}
```

输出 `0|false`。创建表达式没有提供具体元素时，运行时会先填入对应类型的默认值。

### 2. 初始化器与组件读写

初始化器适合在创建时已经知道所有初始值的场景；创建后可以通过 `values[index]` 读取或写入组件。
索引表达式的左右两部分职责不同：`values` 找到数组对象，方括号中的整数选择组件位置。

```java
public final class ArrayAccessExample {
    /**
     * 写入首项和末项，再读取三个组件。
     */
    public static void main(String[] args) {
        int[] values = {2, 4, 6};
        values[0] = 3;
        values[values.length - 1] = 7;
        System.out.println(values[0] + "|" + values[1] + "|" + values[2]);
    }
}
```

输出 `3|4|7`。写入改变的是指定组件，数组长度仍然是 3。

### 3. 数组变量复制的是引用值

把一个数组变量赋给另一个数组变量，不会创建第二个数组对象。两个变量会引用同一对象，通过任一变量
修改组件，另一变量随后读取时也能看到变化；这就是数组别名。若只是想换掉某个变量指向的数组，
应重新赋一个新数组引用，不能把变量重新赋值误认为复制了组件。

```java
public final class ArrayAliasExample {
    /**
     * 观察数组别名写入同一组件后的结果。
     */
    public static void main(String[] args) {
        int[] values = {4, 6, 8};
        int[] alias = values;
        alias[1] = 10;
        System.out.println(values[1] + "|" + (values == alias));
    }
}
```

输出 `10|true`。`values` 和 `alias` 都指向同一个数组；`==` 在这里比较的是引用是否指向同一对象。

## 三、遍历与多维数组

### 1. 需要位置时使用索引循环

索引循环把位置显式写出来，适合需要同时使用索引和值的场景，例如更新某一项、输出位置或访问前后
相邻组件。继续条件应写成 `index < values.length`，这样最后一次循环使用的索引是 `length - 1`。

```java
public final class IndexedTraversalExample {
    /**
     * 输出数组的索引和值。
     */
    public static void main(String[] args) {
        int[] values = {4, 6, 8};
        for (int index = 0; index < values.length; index++) {
            System.out.println(index + "=" + values[index]);
        }
    }
}
```

输出依次为 `0=4`、`1=6`、`2=8`。循环条件使用小于号而不是小于等于号。

### 2. 不需要位置时使用增强 `for`

增强 `for` 直接把每轮的组件值放入循环变量，适合只读地逐项处理。循环变量不是数组索引；给它
重新赋值也不会替换数组组件。需要写回数组时仍应使用索引，或者在循环体中直接使用
`values[index]` 的写法。

```java
public final class EnhancedTraversalExample {
    /**
     * 使用增强 for 汇总数组组件。
     */
    public static void main(String[] args) {
        int[] values = {4, 6, 8};
        int total = 0;
        for (int value : values) {
            total += value;
        }
        System.out.println(total);
    }
}
```

输出 `18`。每一轮的 `value` 依次取得 4、6、8；增强 `for` 隐藏了索引，但没有改变数组边界。

### 3. 二维数组是数组的数组

`int[][]` 的外层组件类型是 `int[]`，因此可以把它理解成“保存多行一维数组的数组”。每一行都是
独立数组，行长度可以不同；访问 `rows[row][column]` 时必须分别检查外层和当前行的长度。

```java
public final class IrregularArrayExample {
    /**
     * 输出外层数组与两行数组各自的长度。
     */
    public static void main(String[] args) {
        int[][] rows = {{1}, {2, 3}};
        System.out.println(rows.length + "|" + rows[0].length + "|" + rows[1].length);
    }
}
```

输出 `2|1|2`。外层有两行，第一行一个组件，第二行两个组件；不能用 `rows[0].length` 代替所有
行的长度。

## 四、数组参数与可变参数

### 1. 数组可以作为方法参数

数组参数的类型写成 `int[] values`。调用方把数组引用值传入方法，方法体可以读取或修改同一个数组
对象；数组长度仍由创建时决定。下面的方法只读数组并返回总和：

```java
public final class ArrayParameterExample {
    /**
     * 使用增强 for 汇总整数数组。
     *
     * @param values 要汇总的整数数组
     * @return 数组组件之和
     */
    static int sum(int[] values) {
        int total = 0;
        for (int value : values) {
            total += value;
        }
        return total;
    }

    /**
     * 调用数组参数方法并输出结果。
     */
    public static void main(String[] args) {
        int[] values = {4, 6, 8};
        System.out.println(sum(values));
    }
}
```

输出 `18`。方法参数接收的是数组引用值，`sum` 在方法体内把参数当作 `int[]` 使用。

### 2. varargs 是末尾数组参数的简写

把最后一个参数写成 `int... values`，方法就能接受零个、一个或多个末尾整数。方法体内的 `values`
仍然按 `int[]` 使用，因此可以读取 `values.length` 和 `values[index]`。调用方也可以直接传入一个
现成的 `int[]`。

```java
public final class VarargsExample {
    /**
     * 返回可变参数的数量与总和。
     *
     * @param label 结果标签
     * @param values 要汇总的整数
     * @return 标签、数量和总和组成的摘要
     */
    static String summarize(String label, int... values) {
        int total = 0;
        for (int value : values) {
            total += value;
        }
        return label + "=" + values.length + "/" + total;
    }

    /**
     * 展示多个、零个和现成数组实参的调用。
     */
    public static void main(String[] args) {
        int[] prepared = {4, 6};
        System.out.println(
                summarize("many", 2, 3, 5)
                        + "|"
                        + summarize("none")
                        + "|"
                        + summarize("array", prepared));
    }
}
```

输出 `many=3/10|none=0/0|array=2/10`。三次调用在方法体内都表现为一个 `int[]`：分别包含三个、
零个和两个组件。

### 3. 固定参数必须写在 varargs 前面

一个方法最多有一个 varargs 参数，而且它必须位于参数列表末尾。下面的 `label` 是固定参数，
`values` 才是可变数量的末尾参数：

```java
public final class TeamFlowVarargsExample {
    /**
     * 输出项目标签与阶段数量。
     *
     * @param project 项目名称
     * @param stages 阶段名称
     */
    static void printStageCount(String project, String... stages) {
        System.out.println(project + "|" + stages.length);
    }

    /**
     * 调用固定参数加 varargs 的方法。
     */
    public static void main(String[] args) {
        printStageCount("TeamFlow", "需求", "开发", "联调");
    }
}
```

输出 `TeamFlow|3`。固定参数先按位置匹配，三个阶段名称进入末尾数组；不能再在 `stages` 后追加固定
参数，也不能在同一个方法中声明第二个 varargs。

## 五、Java 25 与 Java 8 的共同写法

### 1. 数组语言合同没有本课所需的版本差异

JDK 25 和 Java 8 都支持数组声明、`new` 创建、初始化器、`length`、0 起始索引、增强 `for`、二维
数组和数组参数。两版的本课示例可以使用同一份传统 Java 语法，不需要为了版本而改写数组操作。

### 2. varargs 的差异位置

JDK 25 与 Java 8 都支持 `String... values`，并且都要求它是唯一的末尾可变参数。数组、循环和
varargs 本课不依赖 JDK 25 的新语法，因此 Java 8 版本只需选择 Java 8 Project SDK，并使用同样的
传统入口 `public static void main(String[] args)`。

### 3. 什么时候不要用数组

数组适合组件类型统一、长度在创建时确定并且需要整数索引的场景。需要动态增删时不要假装数组会
自动增长；集合会在后续课程中单独讲解。需要只传入几个固定值时也不必为了形式而使用 varargs，先把
方法参数合同写清楚更重要。

## 六、常见错误

数组错误大多来自“数量”和“位置”混淆，或把循环变量、别名和数组对象混为一谈。下面每项都给出
触发条件、原因、后果、错误示例、正确写法和验证方式。

:::pitfalls

### 错误：把 `length` 当成最后一个索引

**触发条件：** 对长度为 3 的数组读取 `values[values.length]`，或用 `index <= values.length` 作为循环条件。

**原因：** 数组从 0 开始编号，合法范围是 `0` 到 `length - 1`；`length` 表示组件数量，不是位置。

**后果：** 访问表达式在运行时抛出 `ArrayIndexOutOfBoundsException`，当前执行路径提前结束。

**错误示例：**

```java
public final class InvalidUpperBound {
    /**
     * 错误地访问 length 位置。
     */
    static int last(int[] values) {
        return values[values.length];
    }
}
```

**正确写法：**

```java
public final class ValidUpperBound {
    /**
     * 读取非空数组的最后一个组件。
     */
    static int last(int[] values) {
        return values[values.length - 1];
    }
}
```

**验证方式：** 用 `{4, 6, 8}` 调用两个方法；错误示例必须以 `ArrayIndexOutOfBoundsException` 结束，正确示例输出 `8`。

### 错误：空数组仍然访问 `length - 1`

**触发条件：** 没有先判断长度，就对 `new int[0]` 读取 `values[values.length - 1]`。

**原因：** 空数组的长度是 0，`length - 1` 等于 -1；空数组不存在任何合法索引。

**后果：** 运行时抛出 `ArrayIndexOutOfBoundsException`，不能得到“最后一个值”。

**错误示例：**

```java
public final class EmptyArrayFailure {
    /**
     * 错误地对可能为空的数组读取末项。
     */
    static int last(int[] values) {
        return values[values.length - 1];
    }
}
```

**正确写法：**

```java
public final class EmptyArraySafeRead {
    /**
     * 返回数组末项；空数组返回 -1 作为本示例的明确结果。
     */
    static int lastOrMinusOne(int[] values) {
        if (values.length == 0) {
            return -1;
        }
        return values[values.length - 1];
    }
}
```

**验证方式：** 传入 `new int[0]`；错误示例必须非零退出，正确示例返回 `-1`。真实业务中应根据合同选择返回值或错误处理方式。

### 错误：索引循环写成 `<=`

**触发条件：** 把 `for (int index = 0; index <= values.length; index++)` 用于访问数组组件。

**原因：** 当 `index == values.length` 时，循环已经走到第一个非法位置。

**后果：** 前面的组件可能已经输出，最后一次访问才抛出越界异常，导致结果看起来“差一点却失败”。

**错误示例：**

```java
public final class InvalidLoopCondition {
    /**
     * 错误地让循环访问 length 位置。
     */
    static void print(int[] values) {
        for (int index = 0; index <= values.length; index++) {
            System.out.println(values[index]);
        }
    }
}
```

**正确写法：**

```java
public final class ValidLoopCondition {
    /**
     * 只访问数组的合法索引。
     */
    static void print(int[] values) {
        for (int index = 0; index < values.length; index++) {
            System.out.println(values[index]);
        }
    }
}
```

**验证方式：** 用长度为 3 的数组运行；正确版本输出三行，错误版本在尝试第四次访问时抛出越界异常。

### 错误：把增强 `for` 的循环变量当成数组组件

**触发条件：** 在 `for (int value : values)` 中给 `value` 赋新值，期待原数组被更新。

**原因：** `value` 是每轮取得的组件值变量，不是组件位置；给它赋值不会写回 `values[index]`。

**后果：** 循环结束后数组仍保持原值，程序可能静默产生错误结果。

**错误示例：**

```java
public final class InvalidEnhancedUpdate {
    /**
     * 错误地只修改增强 for 的临时变量。
     */
    static void addOne(int[] values) {
        for (int value : values) {
            value++;
        }
    }
}
```

**正确写法：**

```java
public final class ValidIndexedUpdate {
    /**
     * 使用索引把修改写回数组组件。
     */
    static void addOne(int[] values) {
        for (int index = 0; index < values.length; index++) {
            values[index]++;
        }
    }
}
```

**验证方式：** 从 `{1, 2}` 开始调用；错误版本仍为 `1|2`，正确版本为 `2|3`。

### 错误：把数组赋值当成复制数组

**触发条件：** 写出 `int[] copy = values`，然后修改 `copy`，却认为 `values` 不会变化。

**原因：** 数组变量保存引用值，赋值复制的是引用；两个变量仍指向同一个数组对象。

**后果：** 通过别名修改会影响调用方看到的数组，造成状态变化超出预期。

**错误示例：**

```java
public final class AliasMisunderstanding {
    /**
     * 这个方法会修改调用方数组，不是创建副本。
     */
    static void update(int[] values) {
        int[] copy = values;
        copy[0] = 99;
    }
}
```

**正确写法：**

```java
public final class ExplicitNewArray {
    /**
     * 创建长度相同的新数组，并复制所有组件。
     */
    static int[] copyArray(int[] values) {
        int[] copy = new int[values.length];
        for (int index = 0; index < values.length; index++) {
            copy[index] = values[index];
        }
        return copy;
    }
}
```

**验证方式：** 调用 `update` 后观察原数组；若需要独立状态，使用 `copyArray` 并验证 `copy != values` 且修改副本不影响原数组。

### 错误：二维数组只检查外层长度

**触发条件：** 对不规则数组使用 `rows.length` 作为每一行的列数。

**原因：** `rows.length` 是行数，`rows[row].length` 才是当前行的组件数；各行长度可以不同。

**后果：** 某些行访问到不存在的列时抛出越界异常，或漏掉合法的列。

**错误示例：**

```java
public final class InvalidRowBoundary {
    /**
     * 错误地把行数当成每行列数。
     */
    static int readLastInFirstRow(int[][] rows) {
        return rows[0][rows.length - 1];
    }
}
```

**正确写法：**

```java
public final class ValidRowBoundary {
    /**
     * 按当前行自己的长度读取最后一个组件。
     */
    static int readLastInFirstRow(int[][] rows) {
        return rows[0][rows[0].length - 1];
    }
}
```

**验证方式：** 用 `{{1}, {2, 3}}` 调用；正确版本返回 `1`，错误版本会因把外层长度 2 换算成第一行索引 1 而越界。

### 错误：varargs 位置或签名重复

**触发条件：** 把固定参数写在 varargs 后面，声明两个 varargs，或同时声明 `int...` 和 `int[]` 的同名方法。

**原因：** 可变参数必须是唯一的最后参数；`int...` 在方法体内就是 `int[]`，两种写法不能构成两个独立签名。

**后果：** 源码无法通过编译，调用者也无法得到方法结果。

**错误示例：**

```java
public final class InvalidVarargsDeclaration {
    /**
     * 错误地把固定参数放在可变参数之后。
     */
    static void wrongPosition(int... values, String label) {}

    /**
     * 错误地声明两个可变参数。
     */
    static void wrongCount(int... left, int... right) {}

    /**
     * 接收可变参数。
     */
    static void receive(int... values) {}

    /**
     * 错误地用数组参数重复同一个签名。
     */
    static void receive(int[] values) {}
}
```

**正确写法：**

```java
public final class ValidVarargsDeclaration {
    /**
     * 接收固定项目名和末尾可变阶段。
     */
    static void print(String project, String... stages) {}
}
```

**验证方式：** 分别用 JDK 25 和 Java 8 编译错误示例，均应失败；正确示例可用零个或多个 `String` 实参调用。

:::

## 七、完整 TeamFlow 程序

### 1. 程序要解决的问题

现在把本课能力串起来：用 `int[] completed` 记录每个阶段是否完成（1 表示完成，0 表示未完成），
用数组长度得到阶段总数，用增强 `for` 统计完成数，再用 varargs 接收待处理阶段名称并读取数量。
这个场景只展示数组数据流，不引入 Spring Boot、数据库或对象模型。

### 2. JDK 25 完整程序

在 IntelliJ IDEA 中创建普通 Java 类 `TeamFlowArrayApplication`，Project SDK 选择 JDK 25，把下面
代码整体放入文件并运行 `main`。也可以在终端用 `javac TeamFlowArrayApplication.java` 后执行
`java TeamFlowArrayApplication`。

```java
public final class TeamFlowArrayApplication {
    /**
     * 统计数组中表示已完成的组件数量。
     *
     * @param completed 每个阶段的完成标记，1 表示完成
     * @return 已完成阶段数
     */
    static int countCompleted(int[] completed) {
        int total = 0;
        for (int value : completed) {
            total += value;
        }
        return total;
    }

    /**
     * 根据已完成数量生成进度状态。
     *
     * @param completed 已完成阶段数
     * @param total 阶段总数
     * @return 面向初学示例的进度文字
     */
    static String progressStatus(int completed, int total) {
        if (completed == total) {
            return "已完成";
        }
        return "进行中";
    }

    /**
     * 统计仍待处理的阶段名称数量。
     *
     * @param stages 待处理阶段名称
     * @return 阶段数量
     */
    static int countPending(String... stages) {
        return stages.length;
    }

    /**
     * 输出 TeamFlow 的阶段进度摘要。
     */
    public static void main(String[] args) {
        int[] completed = {1, 1, 0, 0};
        String[] pendingStages = {"联调", "验收"};
        int completedCount = countCompleted(completed);
        int totalCount = completed.length;

        System.out.println("项目=TeamFlow");
        System.out.println("阶段总数=" + totalCount);
        System.out.println("已完成数=" + completedCount);
        System.out.println("状态=" + progressStatus(completedCount, totalCount));
        System.out.println("待处理数=" + countPending(pendingStages));
    }
}
```

预期控制台输出：

```text
项目=TeamFlow
阶段总数=4
已完成数=2
状态=进行中
待处理数=2
```

执行过程是：`completed.length` 给出 4；`countCompleted` 读取四个组件并累加为 2；状态方法比较
2 和 4；现成的 `String[]` 作为 varargs 实参进入 `countPending`，所以方法体直接读取 `stages.length`。
两个值为 0 的组件与两个待处理阶段名称相互对应，因此三个统计口径一致。

### 3. Java 8 完整程序

新建或打开同名普通 Java 类，把 IntelliJ IDEA 的 Project SDK、Module SDK 和运行配置 JRE 选择为
Java 8，再运行下面完整代码。它刻意使用传统入口和显式类型，不依赖 JDK 25 特有语法；若同一项目
之前选择过 JDK 25，要再次核对项目设置和运行配置中的 JRE。

```java
public final class TeamFlowArrayApplication {
    /**
     * 统计数组中表示已完成的组件数量。
     *
     * @param completed 每个阶段的完成标记，1 表示完成
     * @return 已完成阶段数
     */
    static int countCompleted(int[] completed) {
        int total = 0;
        for (int value : completed) {
            total += value;
        }
        return total;
    }

    /**
     * 根据已完成数量生成进度状态。
     *
     * @param completed 已完成阶段数
     * @param total 阶段总数
     * @return 面向初学示例的进度文字
     */
    static String progressStatus(int completed, int total) {
        if (completed == total) {
            return "已完成";
        }
        return "进行中";
    }

    /**
     * 统计仍待处理的阶段名称数量。
     *
     * @param stages 待处理阶段名称
     * @return 阶段数量
     */
    static int countPending(String... stages) {
        return stages.length;
    }

    /**
     * 输出 TeamFlow 的阶段进度摘要。
     */
    public static void main(String[] args) {
        int[] completed = {1, 1, 0, 0};
        String[] pendingStages = {"联调", "验收"};
        int completedCount = countCompleted(completed);
        int totalCount = completed.length;

        System.out.println("项目=TeamFlow");
        System.out.println("阶段总数=" + totalCount);
        System.out.println("已完成数=" + completedCount);
        System.out.println("状态=" + progressStatus(completedCount, totalCount));
        System.out.println("待处理数=" + countPending(pendingStages));
    }
}
```

Java 8 预期输出与 JDK 25 完全相同。这里没有写“同上”：类、方法、入口、数组和输出均完整给出，
差异只在于运行时应选择 Java 8 Project SDK/JRE。

## 八、练习与参考实现

:::exercise
### 练习：汇总 TeamFlow 阶段

**要求：** 创建 `TeamFlowArrayPractice.java`。在 `main` 中声明 `int[] completed = {1, 0, 1, 1}`，
使用一个带 `int[]` 参数的方法统计已完成数量，再使用一个 `String...` 方法输出待处理阶段数量；
必须分别使用索引循环和增强 `for`，不能使用集合、`Arrays` 工具类或框架。

**验收：** JDK 25 与 Java 8 都能运行，精确输出 `总数=4`、`已完成=3`、`待处理=1` 三行；程序应使用
`completed.length` 得到总数，并且没有访问 `completed[completed.length]`。

:::

### 1. JDK 25 参考实现

```java
public final class TeamFlowArrayPractice {
    /**
     * 使用增强 for 统计完成标记为 1 的阶段。
     *
     * @param completed 完成标记数组
     * @return 已完成阶段数
     */
    static int countCompleted(int[] completed) {
        int count = 0;
        for (int value : completed) {
            if (value == 1) {
                count++;
            }
        }
        return count;
    }

    /**
     * 使用索引循环统计待处理阶段数量。
     *
     * @param stages 待处理阶段名称
     * @return 阶段数量
     */
    static int countPending(String... stages) {
        int count = 0;
        for (int index = 0; index < stages.length; index++) {
            count++;
        }
        return count;
    }

    /**
     * 运行练习参考实现并输出验收结果。
     */
    public static void main(String[] args) {
        int[] completed = {1, 0, 1, 1};
        String[] pending = {"验收"};
        System.out.println("总数=" + completed.length);
        System.out.println("已完成=" + countCompleted(completed));
        System.out.println("待处理=" + countPending(pending));
    }
}
```

预期输出：

```text
总数=4
已完成=3
待处理=1
```

### 2. Java 8 参考实现

```java
public final class TeamFlowArrayPractice {
    /**
     * 使用增强 for 统计完成标记为 1 的阶段。
     *
     * @param completed 完成标记数组
     * @return 已完成阶段数
     */
    static int countCompleted(int[] completed) {
        int count = 0;
        for (int value : completed) {
            if (value == 1) {
                count++;
            }
        }
        return count;
    }

    /**
     * 使用索引循环统计待处理阶段数量。
     *
     * @param stages 待处理阶段名称
     * @return 阶段数量
     */
    static int countPending(String... stages) {
        int count = 0;
        for (int index = 0; index < stages.length; index++) {
            count++;
        }
        return count;
    }

    /**
     * 运行练习参考实现并输出验收结果。
     */
    public static void main(String[] args) {
        int[] completed = {1, 0, 1, 1};
        String[] pending = {"验收"};
        System.out.println("总数=" + completed.length);
        System.out.println("已完成=" + countCompleted(completed));
        System.out.println("待处理=" + countPending(pending));
    }
}
```

Java 8 的完整参考实现使用与 JDK 25 相同的数组和 varargs 语法，运行时选择 Java 8 SDK/JRE 即可；
预期输出仍为 `总数=4`、`已完成=3`、`待处理=1`。

本课完成后，你应该能在看到 `int[]`、`length`、方括号索引、增强 `for` 或 `String...` 时，说明
它们分别表示什么、会读写哪个数组对象，以及下一步应怎样验证索引是否落在合法范围内。
