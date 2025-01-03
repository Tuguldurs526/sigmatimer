package com.example.sigmatimerapp

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException

object SocketUtils {

    private const val SOCKET_URL = "http://192.168.1.2:5000" // Replace with your backend URL
    private var socket: Socket? = null

    init {
        initializeSocket()
    }

    /**
     * Initializes the Socket.IO client.
     */
    private fun initializeSocket() {
        try {
            if (socket == null) {
                socket = IO.socket(SOCKET_URL)
                Log.d("SocketUtils", "Socket initialized")
            }
        } catch (e: URISyntaxException) {
            e.printStackTrace()
            throw RuntimeException("Failed to initialize Socket.IO: ${e.message}")
        }
    }

    /**
     * Connects the Socket.IO client to the server.
     */
    fun connectSocket() {
        try {
            if (socket != null && !socket!!.connected()) {
                socket!!.connect()
                Log.d("SocketUtils", "Socket connected")
            }
        } catch (e: Exception) {
            Log.e("SocketUtils", "Error connecting to socket: ${e.message}")
        }
    }

    /**
     * Disconnects the Socket.IO client from the server.
     */
    fun disconnectSocket() {
        try {
            socket?.disconnect()
            Log.d("SocketUtils", "Socket disconnected")
        } catch (e: Exception) {
            Log.e("SocketUtils", "Error disconnecting socket: ${e.message}")
        }
    }

    /**
     * Emits an event to the server.
     *
     * @param event The event name.
     * @param data The data to send with the event.
     */
    fun emitEvent(event: String, data: JSONObject) {
        try {
            socket?.emit(event, data)
            Log.d("SocketUtils", "Event emitted: $event, Data: $data")
        } catch (e: Exception) {
            Log.e("SocketUtils", "Error emitting event: ${e.message}")
        }
    }

    /**
     * Adds a listener for an event from the server.
     *
     * @param event The event name.
     * @param listener The callback to handle the event data.
     */
    fun addEventListener(event: String, listener: (args: Array<Any>) -> Unit) {
        try {
            socket?.on(event) { args ->
                listener(args)
            }
            Log.d("SocketUtils", "Listener added for event: $event")
        } catch (e: Exception) {
            Log.e("SocketUtils", "Error adding event listener: ${e.message}")
        }
    }

    /**
     * Removes a listener for an event.
     *
     * @param event The event name.
     */
    fun removeEventListener(event: String) {
        try {
            socket?.off(event)
            Log.d("SocketUtils", "Listener removed for event: $event")
        } catch (e: Exception) {
            Log.e("SocketUtils", "Error removing event listener: ${e.message}")
        }
    }

    /**
     * Checks if the socket is connected.
     *
     * @return true if connected, false otherwise.
     */
    fun isSocketConnected(): Boolean {
        return socket?.connected() == true
    }

    /**
     * Returns the socket instance for direct use.
     *
     * @return The [Socket] instance.
     */
    fun getSocket(): Socket? {
        return socket
    }
}
