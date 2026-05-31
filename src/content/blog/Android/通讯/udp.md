---
title: "udp"
description: "udp 的技术笔记。"
pubDate: 2026-05-31
category: "通讯"
tags: [Array]
draft: false
---
# udp

## udp 接受速率最大
```
package com.yunshen.sonic.connect

import android.util.Log
import com.yunshen.sonic.MainApplication
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.SocketException
import java.util.Arrays

class ControlUdpThread : Thread() {

    private var isPaused = true
    var start = false
    private val control = Object() // 只是需要一个对象而已，这个对象没有实际意义

    private var udpSocket: DatagramSocket? = null //用于接收和发送udp数据的socket

    private val resBuffer = ByteArray(BUFFER_SIZE)
    private var udpResPacket: DatagramPacket = DatagramPacket(resBuffer, BUFFER_SIZE)
    private var pcHost: String? = null

    init {
        this.name = TAG
        priority = NORM_PRIORITY + 1
    }

    @Synchronized
    fun setPause(paused: Boolean) {
        if (!paused) {
            synchronized(control) { control.notifyAll() }
        }
        isPaused = paused
    }

    override fun run() {
        start = true
        if (udpSocket == null) {
            udpSocket = DatagramSocket(PORT_RECEIVE) //绑定端口
            udpSocket?.receiveBufferSize = BUFFER_SIZE
        }
        while (start) {
//            Log.e(TAG, "run在运行")
            synchronized(control) {
                if (isPaused) {
                    try {
                        control.wait()
                    } catch (e: InterruptedException) {
                        e.printStackTrace()
                    }
                }
            }

            try {
//                Log.e("ybb", "正在运行")
                udpSocket!!.receive(udpResPacket)
                var nDataLen = udpResPacket.length
                Log.d(TAG, "resBuffer nDataLen = $nDataLen")
                if (nDataLen > ScanProcessManage.UDP_PACK_DATA_SIZE)
                    nDataLen = ScanProcessManage.UDP_PACK_DATA_SIZE

                // check and send to line data
                if (pcHost == null) {
                    pcHost = udpResPacket.address.hostAddress //获取发送消息机器的Ip地址
                }

                if (MainApplication.pcAddress == pcHost) {

                    val header =
                        (resBuffer[0].toInt() and 0xff or (resBuffer[1].toInt() and 0xff shl 8)
                                or (resBuffer[2].toInt() and 0xff shl 16) or (resBuffer[3].toInt() and 0xff shl 24))
                    if (UdpThread.Udp_Debug) {
                        Log.d(TAG, "resBuffer header ======  " + Integer.toHexString(header))
                    }
                    if (header == -0x10000 || header == -0xff5b) {
                        val obtain = UdpLineData.obtain()
                        obtain.copyData(resBuffer, nDataLen)
                        UdpProcessManager.getInstance().addData(obtain)
                    } else {
                        if (UdpThread.Udp_Debug) {
                            Log.d(TAG, "resBuffer else ======  ")
                        }
                    }
                    //每次接收完UDP数据后，重置长度。否则可能会导致下次收到数据包被截断。
                    udpResPacket.length = BUFFER_SIZE
                }

            } catch (e: SocketException) {
                setPause(true)
                udpSocket?.close()
                udpSocket = null
                start = false
            } catch (e: Exception) {
                setPause(true)
                udpSocket?.close()
                udpSocket = null
                start = false
            }
        }
    }

    @Synchronized
    fun cancel() {
        start = false
        udpSocket?.close()
        udpSocket = null
        interrupt()
    }

    companion object {
        private const val TAG = "ControlUdpThread"
        private const val BUFFER_SIZE = 2 * 1024 * 1024
        private const val PORT_RECEIVE: Int = 40009
    }

}
```