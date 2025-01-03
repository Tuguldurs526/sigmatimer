package com.example.sigmatimerapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val titleText: TextView = findViewById(R.id.titleText)
        val instructionText: TextView = findViewById(R.id.instructionText)
        val usernameInput: EditText = findViewById(R.id.usernameInput)
        val startButton: Button = findViewById(R.id.startButton)

        // Attempt to connect the socket when the activity is created
        try {
            SocketUtils.connectSocket()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error connecting to server: ${e.message}", Toast.LENGTH_SHORT).show()
        }

        startButton.setOnClickListener {
            val username = usernameInput.text.toString().trim()
            if (username.isEmpty()) {
                Toast.makeText(this, "Please enter a username", Toast.LENGTH_SHORT).show()
            } else {
                // Register the user on the server
                registerUser(username)

                // Navigate to TimerActivity
                val intent = Intent(this, TimerActivity::class.java)
                intent.putExtra("USERNAME", username)
                startActivity(intent)
            }
        }
    }

    /**
     * Registers the user with the server using the socket connection.
     *
     * @param username The username to register.
     */
    private fun registerUser(username: String) {
        try {
            if (SocketUtils.isSocketConnected()) {
                val registerData = JSONObject(mapOf("username" to username))
                SocketUtils.emitEvent("join", registerData)
                Toast.makeText(this, "User registered successfully", Toast.LENGTH_SHORT).show()
                Log.d("MainActivity", "User $username registered successfully")
            } else {
                Toast.makeText(this, "Failed to connect to server", Toast.LENGTH_SHORT).show()
                Log.e("MainActivity", "Socket is not connected when attempting to register user $username")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error registering user: ${e.message}", Toast.LENGTH_SHORT).show()
            Log.e("MainActivity", "Error registering user $username: ${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Disconnect the socket to prevent memory leaks
        try {
            SocketUtils.disconnectSocket()
            Log.d("MainActivity", "Socket disconnected successfully")
        } catch (e: Exception) {
            e.printStackTrace()
            Log.e("MainActivity", "Error disconnecting socket: ${e.message}")
        }
    }
}
