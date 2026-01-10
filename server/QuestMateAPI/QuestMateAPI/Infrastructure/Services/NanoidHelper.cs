using NanoidDotNet;
using System;

namespace QuestMateAPI.Infrastructure.Services
{
    public static class NanoidHelper
    {
        public static string Generate(int size = 21)
        {
            return Nanoid.Generate(size: size);
        }
    }
}
