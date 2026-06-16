import urllib.request, os

base = os.path.dirname(os.path.abspath(__file__))
screens = [
    ("01-fridge-home", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDU5NDlhY2FhM2UwOTM0ZjM5NTllMTNmZDIzEgsSBxD4zuig1gMYAZIBIwoKcHJvamVjdF9pZBIVQhMyMTM5ODE5MTAzMDEzODEyMzA0&filename=&opi=89354086",
     "https://lh3.googleusercontent.com/aida/AP1WRLsgSYoyTckM4xnPLOtQCuLM7gYlI9mMqkfESkWAIlxzEnry_XPrdggyC5k_DKa19DngQsg5syyJdWGGZaeJ-L3vjIvJJp_xtcJN4msVLnzzS_9SC0hZEGen4QjEbPRuSuCgELyYQ2MEfBTBshz84XHz0lVp6--_S8-L37szVOVZOijh_FzEpSTtrK1yokxxm2_omMWQWHVQ3bxit4-un73sJXHfBnXe8qe08mfQ7FCJq3Q4ziepVNPsI5g"),
    ("02-shelf-detail", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDU5NDlkZjc2ZDcwMjJkN2QzMmU0MTRkZWE0EgsSBxD4zuig1gMYAZIBIwoKcHJvamVjdF9pZBIVQhMyMTM5ODE5MTAzMDEzODEyMzA0&filename=&opi=89354086",
     "https://lh3.googleusercontent.com/aida/AP1WRLskPnWNkWumFRa2slRQllBVH__pew3MtQvd2X7L72jpRil9gxX7LlBbrw506uvk5wz1tcqqUHTxbEhWXgvbS86nt_gFC9Vhb0yL3j74rhmp30tGVxGED_k0bAP1RgTyluFBwT-NqjRCmvm2gKXz8kLcCFf4YcoltvEka5CO8LkukFrRDsdwl-8wFclHXX7FscmJhJz2QzWTEZNuH2duFOZiz_YVhKG2nyB28OndsFkzY_91ak83d90AaJA"),
    ("03-add-item-scan", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDU5NDk3MzA0OTQwMGFkZjFlOTU2MzEwY2JkEgsSBxD4zuig1gMYAZIBIwoKcHJvamVjdF9pZBIVQhMyMTM5ODE5MTAzMDEzODEyMzA0&filename=&opi=89354086",
     "https://lh3.googleusercontent.com/aida/AP1WRLuucmj1ocWacJmnM6t5m7C1G-ICgqBYRZ3sBiF4YVACyq-BxMG7piUNVOI18WUc0LY6UetK3Q1tk9C-96Bcwbck8zpS-xaocxYUtAUeLVsqmQpCSsPg1kZyq1-G0SoO0SARihAbxngcXcb9IAcJBw_9EDGilpMuzj2yHVBzD42gW7pTw2CaUf4_zi2nMIm5nEYa1a8CZDOK9oFwqORA5qck03E6HpdWn8S62fh_iqQcALCI21WXbRrcJho"),
    ("04-alerts", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDU5NDk5OWIyNmYwMGFkZWFhYWRjMTc2MDJiEgsSBxD4zuig1gMYAZIBIwoKcHJvamVjdF9pZBIVQhMyMTM5ODE5MTAzMDEzODEyMzA0&filename=&opi=89354086",
     "https://lh3.googleusercontent.com/aida/AP1WRLvaUqJPwT4iC2W0cR4bIqCoyj3pDe8sMiG9J4W7INZ7gEIXIBvbQD0zuQp6fiSwKFQU04j95g3a01ZycZKXU4Y6QMPy2T2KVwI_J_Y7P1v2hlka8SZm7JVKGsovdyyBdcqYIJJnMnsa6gf0KTWFlC6y-kMsF_vKnPu73sUJpFNNH00IefL0hdYnN41jb_8643NVxZ_sm2FyNauSGqFMznrEn6vt-qdnnifELPMM_X3CrN5_xMddJMXG0EU"),
    ("05-recipes", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDU5NDk4NTlkOGYwMmE5YjY1ZWNkMjU2ZDQzEgsSBxD4zuig1gMYAZIBIwoKcHJvamVjdF9pZBIVQhMyMTM5ODE5MTAzMDEzODEyMzA0&filename=&opi=89354086",
     "https://lh3.googleusercontent.com/aida/AP1WRLs0NBmVINKeAZvdMF4yEeZfw4yV5De_9BlBS6yyJ54JEH10wGQxU1IqlVnSX4g5u-yDrmvVqF5_R-n60czTvQpZdilS7wJQ-OKm3C2FgV0PiUayhXM4W_XG0SuGPMdjwMyT4EJjR5iZjz7wWJGUkUSZgkx1Ggbr5d86_648b3d86bfiaD4HtFb4p9f-tTyY2K15h3p4zNGkRPyVe5ZnGTTQOQVvV4M2oOQWMMduhJ-nA9CRW2xkwf_KCoU"),
    ("06-chat-assistant", "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NDU5NDliY2JjZWQwOTI1ZDNhODJjMzNlM2YwEgsSBxD4zuig1gMYAZIBIwoKcHJvamVjdF9pZBIVQhMyMTM5ODE5MTAzMDEzODEyMzA0&filename=&opi=89354086",
     "https://lh3.googleusercontent.com/aida/AP1WRLsturSeoU_HE3P85AZFU_QpqNS06PcCWFjVWTVh8SgNPqYi6nNtaX9c87lGNCZyW1MLhm9uq7KXXj0Ihn4YUQWaqCXy9PxzDzk_UnaeZNqG7JKbviAPit3a6NFF9Y14Cq4eIS-EFUBJUQcewdtdrXUOtNGhbED4AdmKzr6nx9fCApU8khpZJrhOporJDeHCkT2RHsWTIw3pgZ_DPz4MgeVbzbi_HT1KawZyfeKhr9TCRIu63YLqmDkgseI"),
]
hd = {"User-Agent": "Mozilla/5.0"}
for slug, html_url, shot_url in screens:
    for url, sub, ext in [(html_url, "html", "html"), (shot_url, "screens", "png")]:
        dest = os.path.join(base, sub, f"{slug}.{ext}")
        try:
            req = urllib.request.Request(url, headers=hd)
            with urllib.request.urlopen(req, timeout=60) as r:
                open(dest, "wb").write(r.read())
            print("OK", dest, os.path.getsize(dest))
        except Exception as e:
            print("FAIL", dest, e)
