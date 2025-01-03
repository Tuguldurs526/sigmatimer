package com.example.sigmatimerapp

import retrofit2.Call
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    /**
     * Sends updated user statistics to the backend server.
     * This method uses a callback-based approach.
     *
     * @param stats The user statistics to be updated.
     * @return A [Call] object for handling the response or failure.
     */
    @POST("api/users/update")
    fun updateStats(@Body stats: UserStats): Call<Void>

    /**
     * Sends updated user statistics using coroutines for modern asynchronous handling.
     *
     * @param stats The user statistics to be updated.
     * @return A [Response] object containing the server's response.
     */
    @POST("api/users/update")
    suspend fun updateStatsCoroutine(@Body stats: UserStats): Response<Void>
}
