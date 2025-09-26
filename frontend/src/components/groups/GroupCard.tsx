"use client";

import React from "react";
import { Users, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActivity: string;
  currentBook?: string;
  coverImage?: string;
  description?: string;
  genre?: string;
  isPrivate?: boolean;
  isJoined?: boolean;
}

interface GroupCardProps {
  group: Group;
  variant?: "dashboard" | "groups";
  onGroupClick: (groupId: string) => void;
  onJoinGroup?: (groupId: string) => void;
  className?: string;
  cardIndex?: number;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  variant = "groups",
  onGroupClick,
  onJoinGroup,
  className = "",
}) => {
  const isDashboard = variant === "dashboard";

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer ${className}`}
      padding={isDashboard ? "sm" : "md"}
      shadow="sm"
      hover
      interactive
      onClick={() => onGroupClick(group.id)}
    >
      <div
        className={`flex items-start ${
          isDashboard ? "space-x-3" : "space-x-4"
        }`}
      >
        {/* Group Avatar */}
        <div className="flex-shrink-0">
          {group.coverImage ? (
            <div
              className={`relative ${isDashboard ? "w-12 h-12" : "w-16 h-16"}`}
            >
              <Image
                src={group.coverImage}
                alt={`${group.name} group cover`}
                fill
                className="object-cover rounded-lg"
                sizes={isDashboard ? "48px" : "64px"}
              />
            </div>
          ) : (
            <div
              className={`${
                isDashboard ? "w-12 h-12" : "w-16 h-16"
              } bg-gradient-to-br from-indigo-dye-100 to-safety-orange-100 rounded-lg flex items-center justify-center`}
            >
              <Users
                className={`${
                  isDashboard ? "h-6 w-6" : "h-8 w-8"
                } text-indigo-dye-600`}
              />
            </div>
          )}
        </div>

        {/* Group Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div
                className={`flex items-center space-x-2 ${
                  isDashboard ? "" : "mb-1"
                }`}
              >
                <h3
                  className={`${
                    isDashboard ? "text-sm" : "text-lg"
                  } font-semibold text-gray-900 truncate`}
                >
                  {group.name}
                </h3>
                {group.isPrivate && (
                  <Badge variant="warning" size="sm">
                    Private
                  </Badge>
                )}
                {group.isJoined && (
                  <Badge variant="success" size="sm">
                    Joined
                  </Badge>
                )}
              </div>

              {!isDashboard && group.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div
                className={`flex items-center space-x-4 text-xs text-gray-500 ${
                  isDashboard ? "mt-1" : "mb-3"
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {group.memberCount} members
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {group.lastActivity}
                </div>
                {!isDashboard && group.genre && (
                  <Badge variant="primary" size="sm">
                    {group.genre}
                  </Badge>
                )}
              </div>

              {group.currentBook && (
                <p
                  className={`${
                    isDashboard
                      ? "text-xs text-gray-600 mt-2 truncate"
                      : "text-sm text-gray-700"
                  }`}
                >
                  <span className="font-medium">Currently reading:</span>{" "}
                  {group.currentBook}
                </p>
              )}
            </div>

            <ChevronRight
              className={`${
                isDashboard ? "h-4 w-4" : "h-5 w-5"
              } text-gray-400 flex-shrink-0 ml-2`}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      {!isDashboard && !group.isJoined && onJoinGroup && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onJoinGroup(group.id);
            }}
            variant="primary"
            fullWidth
          >
            Join Group
          </Button>
        </div>
      )}
    </Card>
  );
};

export default GroupCard;
