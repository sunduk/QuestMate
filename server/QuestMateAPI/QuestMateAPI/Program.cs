using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestMateAPI.Application.DTOs.Auth;
using QuestMateAPI.Application.DTOs.Avatar;
using QuestMateAPI.Application.DTOs.Quest;
using QuestMateAPI.Application.Interfaces.Repositories;
using QuestMateAPI.Application.Security;
using QuestMateAPI.Application.Services;
using QuestMateAPI.Application.Services.SocialLogin;
using QuestMateAPI.Infrastructure.Db;
using QuestMateAPI.Infrastructure.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

// CORS 정책 정의
builder.Services.AddCors(options =>
{
    // [개발용 정책]: 묻지도 따지지도 않고 다 허용
    options.AddPolicy("DevPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });

    // [배포용 정책]: 실제 내 도메인만 딱 허용 (VIP 입장)
    options.AddPolicy("ProdPolicy", policy =>
    {
        // 나중에 실제 배포할 프론트엔드 도메인을 적어주세요.
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});



/////////////////////
/// DI등록.
builder.Services.AddSingleton<DapperContext>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ILocalAccountRepository, LocalAccountRepository>();
builder.Services.AddScoped<ISocialAccountRepository, SocialAccountRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

builder.Services.AddScoped<IAvatarService, AvatarService>();

builder.Services.AddScoped<IQuestRepository, QuestRepository>();
builder.Services.AddScoped<IQuestService, QuestService>();

builder.Services.AddScoped<ICommonAuthService, CommonAuthService>();
builder.Services.AddHttpClient<INaverAuthService, NaverAuthService>();
builder.Services.AddHttpClient<IKakaoAuthService, KakaoAuthService>();
builder.Services.AddHttpClient<IGoogleAuthService, GoogleAuthService>();

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

// JWT 설정 및 서비스 등록
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<JwtTokenGenerator>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt.SecretKey)
            )
        };
    });

builder.Services.AddAuthorization();


builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."

    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
/////////////////////


var app = builder.Build();

// [필수] 이 코드가 있어야 wwwroot 폴더가 웹으로 노출됩니다.
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. 환경에 따라 정책 골라 쓰기
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevPolicy"); // 로컬 개발
}
else
{
    app.UseCors("ProdPolicy"); // 실서버 배포
}


app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
