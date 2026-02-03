"use client"

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, message: "Your adoption request has been approved", time: "2h ago" },
    { id: 2, message: "New pet available for adoption", time: "5h ago" },
  ])

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon icon="mdi:bell" className="mr-2 h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border">
            <div className="px-4 py-2 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            {notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}