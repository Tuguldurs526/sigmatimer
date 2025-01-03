package com.example.sigmatimerapp

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class TimerActivity : AppCompatActivity() {

    private lateinit var timerView: TextView
    private lateinit var startButton: Button
    private lateinit var resetButton: Button
    private lateinit var dashboardButton: Button
    private lateinit var workTimeInput: EditText
    private lateinit var restTimeInput: EditText

    private var timer: CountDownTimer? = null
    private var isRunning = false
    private var timeLeftInMillis: Long = 25 * 60 * 1000
    private var totalFocusTime = 0
    private var totalRestTime = 0
    private var pomodorosFinished = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_timer)

        val username = intent.getStringExtra("USERNAME") ?: "Guest"

        // Initialize views
        timerView = findViewById(R.id.timerView)
        startButton = findViewById(R.id.startButton)
        resetButton = findViewById(R.id.resetButton)
        dashboardButton = findViewById(R.id.dashboardButton)
        workTimeInput = findViewById(R.id.workTimeInput)
        restTimeInput = findViewById(R.id.restTimeInput)

        // Register user with the backend via Socket.IO
        SocketUtils.emitEvent("join", JSONObject(mapOf("username" to username)))

        // Setup button listeners
        startButton.setOnClickListener { toggleTimer(username) }
        resetButton.setOnClickListener { resetTimer(username) }
        dashboardButton.setOnClickListener { goToDashboard(username) }

        // Setup socket listeners
        setupSocketListeners()
    }

    private fun toggleTimer(username: String) {
        if (isRunning) {
            pauseTimer(username)
        } else {
            startWorkTimer(username)
        }
    }

    private fun startWorkTimer(username: String) {
        val workTime = workTimeInput.text.toString().toIntOrNull() ?: 0
        if (workTime <= 0) {
            Toast.makeText(this, "Please enter a valid work time", Toast.LENGTH_SHORT).show()
            workTimeInput.requestFocus()
            return
        }
        timeLeftInMillis = workTime * 60 * 1000L

        timer = object : CountDownTimer(timeLeftInMillis, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                timeLeftInMillis = millisUntilFinished
                updateTimer()
                val tickData = JSONObject(
                    mapOf(
                        "username" to username,
                        "timeLeft" to millisUntilFinished / 1000, // Send seconds, not milliseconds
                        "isWorkSession" to true
                    )
                )
                SocketUtils.emitEvent("timerUpdate", tickData)
            }

            override fun onFinish() {
                totalFocusTime += workTime
                pomodorosFinished++
                isRunning = false
                startButton.text = "Start"
                Toast.makeText(this@TimerActivity, "Work time completed!", Toast.LENGTH_SHORT).show()
                sendStatsToServer(username)
            }
        }.start()

        isRunning = true
        startButton.text = "Pause"
    }

    private fun pauseTimer(username: String) {
        timer?.cancel()
        isRunning = false
        startButton.text = "Resume"

        val pauseData = JSONObject(
            mapOf(
                "username" to username,
                "timeLeft" to timeLeftInMillis / 1000, // Send seconds, not milliseconds
                "isWorkSession" to false
            )
        )
        SocketUtils.emitEvent("timerUpdate", pauseData)
    }

    private fun resetTimer(username: String) {
        timer?.cancel()
        timeLeftInMillis = 25 * 60 * 1000
        updateTimer()
        isRunning = false
        startButton.text = "Start"

        val resetData = JSONObject(mapOf("username" to username))
        SocketUtils.emitEvent("resetTimer", resetData)
    }

    private fun updateTimer() {
        val minutes = (timeLeftInMillis / 1000) / 60
        val seconds = (timeLeftInMillis / 1000) % 60
        timerView.text = String.format("%02d:%02d", minutes, seconds)
    }

    private fun goToDashboard(username: String) {
        val intent = Intent(this, DashboardActivity::class.java)
        intent.putExtra("USERNAME", username)
        intent.putExtra("FOCUS_TIME", totalFocusTime)
        intent.putExtra("REST_TIME", totalRestTime)
        intent.putExtra("POMODOROS_FINISHED", pomodorosFinished)
        startActivity(intent)
    }

    private fun sendStatsToServer(username: String) {
        val userStats = UserStats(
            username = username,
            focusMinutes = totalFocusTime,
            restMinutes = totalRestTime,
            pomodorosFinished = pomodorosFinished
        )

        ApiClient.getApiService().updateStats(userStats).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@TimerActivity, "Stats successfully updated!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@TimerActivity, "Failed to update stats: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@TimerActivity, "Error updating stats: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun setupSocketListeners() {
        SocketUtils.addEventListener("timerUpdate") { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                val data = args[0] as JSONObject
                Log.d("TimerActivity", "Received timerUpdate: $data")
                runOnUiThread {
                    val newTimeLeft = data.optLong("timeLeft", timeLeftInMillis) * 1000 // Convert seconds to milliseconds
                    if (newTimeLeft != timeLeftInMillis) {
                        timeLeftInMillis = newTimeLeft
                        isRunning = data.optBoolean("isWorkSession", false)
                        updateTimer()
                    }
                }
            } else {
                Log.e("TimerActivity", "Invalid timerUpdate data: $args")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        SocketUtils.removeEventListener("timerUpdate")
        SocketUtils.disconnectSocket()
    }
}
