package com.example.sigmatimerapp

import io.socket.client.IO
import io.socket.client.Socket
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.URISyntaxException

object ApiClient {

    // Base URL of the backend server (WebSocket and REST API)
    private const val BASE_URL = "http://192.168.1.2:5000" // Replace with your Ngrok URL

    private var _socket: Socket? = null
    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    /**
     * Returns a singleton instance of Socket.IO client.
     */
    val socket: Socket
        get() {
            if (_socket == null) {
                initializeSocket()
            }
            return _socket!!
        }

    /**
     * Initializes the Socket.IO client with the backend URL.
     */
    private fun initializeSocket() {
        try {
            _socket = IO.socket(BASE_URL)
        } catch (e: URISyntaxException) {
            e.printStackTrace()
            throw RuntimeException("Failed to initialize Socket.IO client: ${e.message}")
        }
    }

    /**
     * Returns the Retrofit API service instance for making REST API calls.
     *
     * @return An instance of [ApiService].
     */
    fun getApiService(): ApiService {
        return retrofit.create(ApiService::class.java)
    }

    /**
     * Connects the Socket.IO client to the backend server.
     */
    fun connectSocket() {
        try {
            if (_socket == null) {
                initializeSocket()
            }
            _socket?.connect()
        } catch (e: Exception) {
            e.printStackTrace()
            throw RuntimeException("Error connecting to the socket: ${e.message}")
        }
    }

    /**
     * Disconnects the Socket.IO client from the backend server.
     */
    fun disconnectSocket() {
        try {
            _socket?.disconnect()
        } catch (e: Exception) {
            e.printStackTrace()
            throw RuntimeException("Error disconnecting from the socket: ${e.message}")
        }
    }

    /**
     * Checks if the Socket.IO client is currently connected to the server.
     *
     * @return true if connected, false otherwise.
     */
    fun isConnected(): Boolean {
        return _socket?.connected() == true
    }

    /**
     * Emits an event through the Socket.IO client.
     *
     * @param event The name of the event.
     * @param data The data to send with the event.
     */
    fun emitEvent(event: String, data: Any) {
        try {
            _socket?.emit(event, data)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
