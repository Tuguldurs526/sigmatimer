package com.example.sigmatimerapp

import android.os.Bundle
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import io.socket.client.Socket
import org.json.JSONObject

class DashboardActivity : AppCompatActivity() {

    private lateinit var welcomeText: TextView
    private lateinit var focusTimeText: TextView
    private lateinit var restTimeText: TextView
    private lateinit var pomodorosFinishedText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Initialize views
        welcomeText = findViewById(R.id.welcomeText)
        focusTimeText = findViewById(R.id.focusTime)
        restTimeText = findViewById(R.id.restTime)
        pomodorosFinishedText = findViewById(R.id.pomodorosFinished)

        // Get username from intent
        val username = intent.getStringExtra("USERNAME") ?: "Guest"
        welcomeText.text = "Welcome, $username!"

        // Register the user with the socket and set up listeners
        if (SocketUtils.isSocketConnected()) {
            SocketUtils.emitEvent("join", JSONObject(mapOf("username" to username)))
        } else {
            Toast.makeText(this, "Socket is not connected", Toast.LENGTH_SHORT).show()
            Log.e("DashboardActivity", "Socket is not connected")
        }

        setupSocketListeners()
    }

    private fun setupSocketListeners() {
        // Listen for dashboard updates
        SocketUtils.addEventListener("dashboardUpdate") { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                val data = args[0] as JSONObject
                Log.d("DashboardActivity", "Received dashboardUpdate: $data")
                runOnUiThread {
                    updateDashboard(
                        focusTime = data.optInt("focusTime", 0),
                        restTime = data.optInt("restTime", 0),
                        pomodorosFinished = data.optInt("pomodorosFinished", 0)
                    )
                }
            } else {
                Log.e("DashboardActivity", "Invalid dashboardUpdate data: $args")
            }
        }

        // Handle socket disconnection
        SocketUtils.addEventListener("disconnect") {
            runOnUiThread {
                Toast.makeText(this, "Disconnected from server", Toast.LENGTH_SHORT).show()
                Log.w("DashboardActivity", "Socket disconnected")
            }
        }

        // Handle connection errors
        SocketUtils.addEventListener("connect_error") { args ->
            val error = args.firstOrNull()
            runOnUiThread {
                val errorMessage = if (error is Exception) {
                    error.message
                } else {
                    "Unknown connection error"
                }
                Toast.makeText(this, "Connection error: $errorMessage", Toast.LENGTH_SHORT).show()
                Log.e("DashboardActivity", "Connection error: $errorMessage")
            }
        }
    }

    private fun updateDashboard(focusTime: Int, restTime: Int, pomodorosFinished: Int) {
        focusTimeText.text = "Focus Time (min): $focusTime"
        restTimeText.text = "Rest Time (min): $restTime"
        pomodorosFinishedText.text = "Pomodoros Finished: $pomodorosFinished"
    }

    override fun onDestroy() {
        super.onDestroy()
        SocketUtils.removeEventListener("dashboardUpdate")
        SocketUtils.removeEventListener("disconnect")
        SocketUtils.removeEventListener("connect_error")
    }
}
