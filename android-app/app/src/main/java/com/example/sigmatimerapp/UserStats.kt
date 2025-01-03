package com.example.sigmatimerapp

import com.google.gson.annotations.SerializedName

/**
 * Data class representing user statistics.
 *
 * @param username The username of the user.
 * @param focusMinutes The total minutes spent focusing.
 * @param restMinutes The total minutes spent resting.
 * @param pomodorosFinished The total number of pomodoros completed.
 */
data class UserStats(
    @SerializedName("username")
    val username: String,

    @SerializedName("focus_minutes")
    val focusMinutes: Int = 0, // Default value in case the backend omits this field

    @SerializedName("rest_minutes")
    val restMinutes: Int = 0, // Default value in case the backend omits this field

    @SerializedName("pomodoros_completed")
    val pomodorosFinished: Int = 0 // Default value in case the backend omits this field
)
