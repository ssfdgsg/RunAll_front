import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { useAuth } from '../contexts/AuthContext'

const Terminal = () => {
  const { instanceId } = useParams()
  const { token } = useAuth()
  const terminalRef = useRef(null)
  const socketRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // 初始化终端
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, monospace',
      theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#ffffff40'
      },
      rows: 30,
      cols: 100
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    termRef.current = term
    fitAddonRef.current = fitAddon

    if (terminalRef.current) {
      term.open(terminalRef.current)
      // 延迟调用 fit，等待 DOM 完全渲染
      setTimeout(() => {
        try {
          if (terminalRef.current && fitAddon) {
            fitAddon.fit()
          }
        } catch (e) {
          console.error('Fit error:', e)
        }
      }, 300)
    }

    term.writeln('终端已初始化，正在连接...')

    // 监听窗口大小变化
    const handleResize = () => {
      if (fitAddon) {
        try {
          fitAddon.fit()
          sendResize()
        } catch (e) {
          console.error('Resize error:', e)
        }
      }
    }
    window.addEventListener('resize', handleResize)

    // 建立WebSocket连接
    if (instanceId && token) {
      // 延迟连接，确保终端已完全初始化
      setTimeout(() => {
        connectWebSocket()
      }, 200)
    } else {
      term.writeln('\x1b[31m错误: 缺少实例ID或Token\x1b[0m')
    }

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      if (termRef.current) {
        termRef.current.dispose()
      }
    }
  }, [instanceId, token])

  const sendResize = () => {
    if (!isConnected || !termRef.current || !socketRef.current) return

    const msg = {
      type: 'resize',
      data: {
        rows: termRef.current.rows,
        cols: termRef.current.cols
      }
    }
    socketRef.current.send(JSON.stringify(msg))
  }

  const connectWebSocket = () => {
    const term = termRef.current
    
    // 检查 token
    if (!token) {
      term.writeln('\x1b[31m错误: Token 不存在，请先登录\x1b[0m')
      return
    }
    
    console.log('Token:', token)
    console.log('Instance ID:', instanceId)
    
    // WebSocket 连接到后端 API 服务器
    const wsUrl = `wss://api.runall.me:7999/api/ws/exec?token=${encodeURIComponent(token)}`
    term.writeln('正在连接到 WebSocket...')
    console.log('WebSocket URL:', wsUrl)

    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      term.writeln('✓ WebSocket连接成功')

      // 发送初始化消息（instance_id 必须是数字类型，使用字符串拼接避免精度丢失）
      const initMsgStr = `{"type":"init","data":{"instance_id":${instanceId},"command":["/bin/bash"],"tty":true}}`
      
      console.log('Sending init message:', initMsgStr)
      ws.send(initMsgStr)
      term.writeln('✓ 初始化完成\r\n')

      // 监听终端输入
      term.onData((data) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return
        
        // Base64编码输入数据
        const encoded = btoa(data)
        const msg = {
          type: 'input',
          data: {
            data: encoded
          }
        }
        socketRef.current.send(JSON.stringify(msg))
      })

      // 监听终端大小变化
      term.onResize(({ rows, cols }) => {
        sendResize()
      })

      // 调整终端大小并通知服务器
      setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
          sendResize()
        }
      }, 100)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        
        switch (msg.type) {
          case 'output':
            // 解码base64数据并写入终端
            const data = atob(msg.data)
            term.write(data)
            break
            
          case 'error':
            term.writeln('\r\n\x1b[31m错误: ' + msg.message + '\x1b[0m\r\n')
            break
            
          case 'exit':
            term.writeln('\r\n\x1b[32m进程退出，退出码: ' + msg.code + '\x1b[0m\r\n')
            setIsConnected(false)
            break
        }
      } catch (e) {
        console.error('解析消息失败:', e)
        term.writeln('\r\n\x1b[31m解析消息失败: ' + e.message + '\x1b[0m\r\n')
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      term.writeln('\r\n\x1b[31mWebSocket连接错误\x1b[0m')
      term.writeln('\x1b[33m可能的原因：\x1b[0m')
      term.writeln('1. 后端 WebSocket 服务未启动')
      term.writeln('2. Token 认证失败')
      term.writeln('3. 实例不存在或无权限')
      term.writeln('4. 网络连接问题\r\n')
      setIsConnected(false)
    }

    ws.onclose = (event) => {
      setIsConnected(false)
      term.writeln('\r\n\x1b[33mWebSocket连接已关闭\x1b[0m')
      if (event.code !== 1000) {
        term.writeln(`\x1b[31m关闭码: ${event.code}, 原因: ${event.reason || '未知'}\x1b[0m\r\n`)
      }
    }
  }

  return <div className="terminal-page" ref={terminalRef} />
}

export default Terminal
