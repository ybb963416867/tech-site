---
title: "pinctl和gpio子系统（一）-22"
description: "pinctl和gpio子系统（一）-22 的技术笔记。"
pubDate: 2026-05-29
category: "内核"
tags: [Notes]
draft: false
---
# pinctl和gpio子系统（一）

## 什么是pinctrl和gpio子系统?

前面编写的基于设备树的 LED 驱动，本质上还是配置 LED 使用的 GPIO 寄存器，驱动开发方式和裸机基本没区别。Linux 内核提供了 pinctrl 和 gpio 子系统用于 GPIO 驱动，借助 pinctrl 和 gpio 子系统来简化 GPIO 驱动开发。

## Linux Pinctrl子系统提供的功能是什么?

- 管理系统中所有的可以控制的pin，在系统初始化的时候，枚举所有可以控制的pin，并标识这些pin。
- 管理这些pin 的复用(Multiplexing)。对于SOC而言，其引脚除了配置成普通的GPIO之外，若干个引脚还可以组成一个pin group，形成特定的功能。
- 配置这些pin 的特性。例如使能或关闭引脚上的pull-up、pull-down 电阻，配置引脚的driver strength。

## 不同soc 厂家的pin controller的节点

这些节点里都是把某些引脚复用成某些功能。

**nxp**：

```
pinctrl_tsc: tscgrp {
	fsl,pins =<
		MX6UL_PAD_GPI01_I001_GPIO1_I001			oxb0
		MX6UL_PAD_GP101_I002_GPI01_I002			0xb0
		MX6UL PADGPI01I003GPI01I003				Oxb0
		MX6UL_PAD GPI01I004 GP1O1_I004			0xb0
	>;
};
pinctrl_uart1: uart1grp {
	fsl,pins =<
		MX6UL_PAD _UART1_TX_DATA UART1DCE_TX 	0x1b0b1
		MX6UL_PAD_UART1_RX_DATA_ _UART1DCE RX 	0x1b0b1
	>;
};
pinctrl_uart2: uart2grp {
	fsl,pins =<
		MX6UL PAD_ _UART2_TX_DATA__UART2_DCE_TX 	Ox1b0b1
		MX6UL_PAD _UART2 RX_DATA UART2_DCE RX 		0x1b0b1
		MX6UL_PAD__UART3_RX_DATA__ _UART2_DCE_RTS 	Ox1b0b1
		MX6UL_PAD__UART3_TX_DATA__UART2_DCE_CTs 	ox1b0b1
	>;
};

```

**三星：**

```
gt911_irq: gt911-irq {
	nexell,pins ="gpiob-29","gptoe-30";
	nexell,pin-function = <1>;
	nexell,pin-pull = <2>;
	nexell,pin-strength = <2>;
};
pinctrl_gpio_keys: pinctrl_gpio_keys {
	nexell,pins = "allve-8", "gpioa-28", "gpiob-9", "gpiob-30", "gpiob-31";
	nexell,pin-function = <0>;
	nexell,pin-pull = <1>;
	nexell,pin-strength = <0>;
};
buzzer:buzzer {
	nexell,pins = "gpioc-14";
	nexell,pin-function = <0>;
	nexell,pin-pull = <1>;
	nexell,pin-strength = <0>;
};
led:led {
	nexell,pins = "aploc-1";
	nexell,pin-function = <0>;
	nexell,pin-pull = <1>;
	nexell,pin-strength = <0>;
};
Rax485:max485 {
	nexell,pins = "gpioc-6";
	nexell,pin-function = <0>;
	nexell,pin-pull = <1>;
	nexell,pin-strength = <0>;
};

```

**瑞星微：**

```
	lcd-panel {
		lcd_panel_reset: lcd-panel-reset {
			rockchip,pins = <4 29 RK_FUNC_GPIO &pcfg_pull_up>;
		};

		lcd_en: lcd-en {
			rockchip,pins = <1 1 RK_FUNC_GPIO &pcfg_pull_up>;
		};
	};

```

## 不同soc厂家的pin controller的节点里面的属性都是什么意思

可以通过Linux源码目录/Documentation/devicetree/bindings下的 txt 文档查看。

## 怎么在代码里面使用pin controller里面定义好的节点?

**例1:**

```
pinctrl-names = "default";
pinctrl-0= <&pinctrl_hog_1>;
```

**含义:**

```
pinctrl-names = "default";
```

- 设备的状态，可以有多个状态，default为状态0

```
pinctrl-0 = <&pinctrl_hog_1>;
```

- 第0个状态所对应的引脚配置，也就是default状态对应的引脚在pin controller里面定义好的节点pinctrl_hog_1里面的管脚配置

**例2：**

```
pinctrl-names ="default", "wake up";
pinctrl-0 = <&pinctrl_hog_1>;
pinctrl-1 = <&pinctrl_hog_2>;
```

**含义:**

```
pinctrl-names ="default", "wake up";
```

- 设备的状态，可以有多个状态，default为状态0,wake up为状态1

```
pinctrl-0 =<&pinctrl_hog_1>;
```

- 第0个状态所对应的引脚配置，也就是default状态对应的引脚在pin controller里面定义好的节点pinctrl_hog_1里面的管脚配置

```
pinctrl-1 = <&pinctrl_hog_2>;
```

- 第1个状态所对应的引脚配置，也就是wake up状态对应的引脚在pin controller里面定义好的节点pinctrl_hog_2里面的管脚配置

**例3:**

```
pinctrl-names = "default"
pinctrl-0 =<&pinctrl_hog_1,
			&pinctrl_hog_2>;
```

**含义**

```
pinctrl-names = "default";
```

- 设备的状态，可以有多个状态，default为状态0

```
pinctrl-0=<&pinctrl_hog_1, &pinctrl_hog_2>;
```

- 第0个状态所对应的引脚配置，也就是default 状态对应的引脚在pin controller里面定义好的节点,对应 pinctrl_hog_1和 pinctrl_hog_2这俩个节点的管脚配置

